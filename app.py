import os
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, abort
from dotenv import load_dotenv
from models import db, Producto, Gato, Usuario, SolicitudAdopcion, Pedido, PedidoItem
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from seed import seed_database

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'catfeteria_app_secret_key_change_in_prod')

# Configure database
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:////tmp/catfeteria.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.rol != 'admin':
            flash("Acceso restringido a administradores.", "error")
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# Flag to avoid repeated initialization
_db_initialized = False

@app.before_request
def auto_init_database():
    global _db_initialized
    if not _db_initialized:
        try:
            db.create_all()
            if Producto.query.count() == 0 or Gato.query.count() == 0:
                seed_database(force=False)
            _db_initialized = True
        except Exception as e:
            db.session.rollback()
            app.logger.warning(f"DB auto-init notice: {e}")

@app.route('/setup-db', methods=['GET', 'POST'])
def setup_db():
    token = request.args.get('token')
    expected_token = os.environ.get('SETUP_TOKEN', 'catfeteria_setup_2025')
    is_admin = current_user.is_authenticated and getattr(current_user, 'rol', None) == 'admin'
    
    if not is_admin and (not token or token != expected_token):
        flash("Acceso no autorizado para configurar la base de datos.", "error")
        return redirect(url_for('index'))

    force = request.args.get('force', 'false').lower() == 'true'
    seed_database(force=force)
    flash("¡Base de datos y catálogo sincronizados con éxito!", "success")
    return redirect(url_for('admin_dashboard' if is_admin else 'index'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        user = Usuario.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            flash(f"¡Bienvenido de vuelta, {user.nombre}!", "success")
            if user.rol == 'admin':
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('index'))
        flash('Usuario o contraseña incorrectos', 'error')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Has cerrado sesión exitosamente", "info")
    return redirect(url_for('index'))

@app.route('/admin')
@admin_required
def admin_dashboard():
    total_productos = Producto.query.count()
    total_gatos = Gato.query.count()
    total_usuarios = Usuario.query.count()
    return render_template(
        'admin/dashboard.html',
        total_productos=total_productos,
        total_gatos=total_gatos,
        total_usuarios=total_usuarios
    )

@app.route('/admin/productos')
@admin_required
def admin_productos():
    productos = Producto.query.all()
    return render_template('admin/productos.html', productos=productos)

@app.route('/admin/productos/editar/<int:id>', methods=['GET', 'POST'])
@admin_required
def editar_producto(id):
    producto = Producto.query.get_or_404(id)
    if request.method == 'POST':
        try:
            precio = float(request.form.get('precio', 0))
        except (ValueError, TypeError):
            flash('El precio ingresado no es válido', 'error')
            return render_template('admin/producto_form.html', producto=producto)
            
        producto.titulo = request.form.get('titulo', '').strip()
        producto.descripcion = request.form.get('descripcion', '').strip()
        producto.precio = precio
        producto.imagenUrl = request.form.get('imagenUrl', '').strip()
        producto.categoria = request.form.get('categoria', producto.categoria)
        db.session.commit()
        flash('Producto actualizado correctamente', 'success')
        return redirect(url_for('admin_productos'))
    return render_template('admin/producto_form.html', producto=producto)

@app.route('/admin/gatos')
@admin_required
def admin_gatos():
    gatos = Gato.query.all()
    return render_template('admin/gatos.html', gatos=gatos)

@app.route('/admin/gatos/editar/<int:id>', methods=['GET', 'POST'])
@admin_required
def editar_gato(id):
    gato = Gato.query.get_or_404(id)
    if request.method == 'POST':
        try:
            edad_meses = int(request.form.get('edad_meses') or 0)
        except (ValueError, TypeError):
            flash('La edad en meses debe ser un número entero', 'error')
            return render_template('admin/gato_form.html', gato=gato)

        gato.nombre = request.form.get('nombre', '').strip()
        gato.descripcion = request.form.get('descripcion', '').strip()
        gato.edad_meses = edad_meses
        gato.imagenUrl = request.form.get('imagenUrl', '').strip()
        gato.adoptado = 'adoptado' in request.form
        db.session.commit()
        flash('Gato actualizado correctamente', 'success')
        return redirect(url_for('admin_gatos'))
    return render_template('admin/gato_form.html', gato=gato)

@app.route('/admin/usuarios')
@admin_required
def admin_usuarios():
    usuarios = Usuario.query.all()
    return render_template('admin/usuarios.html', usuarios=usuarios)

@app.route('/')
def index():
    cats = Gato.query.filter_by(adoptado=False).limit(4).all()
    products = Producto.query.filter(Producto.categoria.in_(['suplemento', 'accesorio'])).limit(4).all()
    cafes = Producto.query.filter(Producto.categoria.in_(['cafe', 'postre'])).limit(4).all()
    return render_template('index.html', gatos=cats, suplementos=products, cafes=cafes)

@app.route('/menu')
def menu():
    cafes = Producto.query.filter(Producto.categoria.in_(['cafe', 'postre'])).all()
    return render_template('menu.html', cafes=cafes)

@app.route('/suplementos')
def suplementos():
    productos = Producto.query.filter(Producto.categoria.in_(['suplemento', 'accesorio'])).all()
    return render_template('suplementos.html', suplementos=productos)

@app.route('/adopciones')
def adopciones():
    gatos = Gato.query.filter_by(adoptado=False).all()
    return render_template('adopciones.html', gatos=gatos)

@app.route('/cuenta')
def cuenta():
    return render_template('cuenta.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Producto.query.count() == 0:
            seed_database(force=False)
    app.run(debug=True, port=5000)
