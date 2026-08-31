import os
from flask import Flask, render_template, request, redirect, url_for, flash
from dotenv import load_dotenv
from models import db, Producto, Gato, Usuario
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'default_secret_key')

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

@app.route('/setup-db')
def setup_db():
    db.create_all()
    
    # Create default admin if not exists
    admin = Usuario.query.filter_by(username='admin').first()
    if not admin:
        admin = Usuario(nombre='Administrador', username='admin', email='admin@catfeteria.com', password=generate_password_hash('admin'), rol='admin')
        db.session.add(admin)

    Producto.query.delete()
    Gato.query.delete()
    
    cafes = [
        Producto(titulo="Café Espresso", descripcion="Un clásico intenso y aromático.", precio=2.50, categoria="cafe", imagenUrl="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80"),
        Producto(titulo="Café Latte", descripcion="Suave mezcla de espresso y leche vaporizada.", precio=3.50, categoria="cafe", imagenUrl="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80"),
        Producto(titulo="Café Mocha", descripcion="Un espresso con un toque de chocolate.", precio=4.00, categoria="cafe", imagenUrl="https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80"),
    ]
    suplementos = [
        Producto(titulo="Arena de Gatos", descripcion="4kg de la mejor arena para tu gato", precio=9.99, categoria="suplemento", imagenUrl="https://images.unsplash.com/photo-1593466144883-7d9fc84bf321?w=500&q=80"),
        Producto(titulo="Juguete Interactivo Láser", descripcion="Estimula la mente y el cuerpo de tu gato.", precio=14.99, categoria="accesorio", imagenUrl="https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&q=80"),
        Producto(titulo="Comida para Gatos", descripcion="Mejora la salud de la piel y el pelaje. 5kg", precio=12.99, categoria="suplemento", imagenUrl="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80"),
    ]
    gatos = [
        Gato(nombre="Oreo", descripcion="Un gato muy jugueton y listo para un hogar", edad_meses=12, imagenUrl="https://images.unsplash.com/photo-1513245543132-31f507417b26?w=500&q=80"),
        Gato(nombre="Milo", descripcion="Un gato cariñoso que busca una familia amorosa", edad_meses=24, imagenUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80"),
        Gato(nombre="Chetto", descripcion="Un gato muy cariño que busca un hogar", edad_meses=6, imagenUrl="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80"),
    ]
    db.session.bulk_save_objects(cafes)
    db.session.bulk_save_objects(suplementos)
    db.session.bulk_save_objects(gatos)
    db.session.commit()
    return "¡Base de datos y datos iniciales configurados con éxito! Ya puedes volver a la página principal."

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = Usuario.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            if user.rol == 'admin':
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('index'))
        flash('Usuario o contraseña incorrectos', 'error')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_dashboard():
    if current_user.rol != 'admin':
        return redirect(url_for('index'))
    return render_template('admin/dashboard.html')

@app.route('/admin/productos')
@login_required
def admin_productos():
    if current_user.rol != 'admin':
        return redirect(url_for('index'))
    productos = Producto.query.all()
    return render_template('admin/productos.html', productos=productos)

@app.route('/admin/productos/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar_producto(id):
    if current_user.rol != 'admin':
        return redirect(url_for('index'))
    producto = Producto.query.get_or_404(id)
    if request.method == 'POST':
        producto.titulo = request.form.get('titulo')
        producto.descripcion = request.form.get('descripcion')
        producto.precio = float(request.form.get('precio'))
        producto.imagenUrl = request.form.get('imagenUrl')
        db.session.commit()
        flash('Producto actualizado correctamente', 'success')
        return redirect(url_for('admin_productos'))
    return render_template('admin/producto_form.html', producto=producto)

@app.route('/admin/gatos')
@login_required
def admin_gatos():
    if current_user.rol != 'admin':
        return redirect(url_for('index'))
    gatos = Gato.query.all()
    return render_template('admin/gatos.html', gatos=gatos)

@app.route('/admin/gatos/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar_gato(id):
    if current_user.rol != 'admin':
        return redirect(url_for('index'))
    gato = Gato.query.get_or_404(id)
    if request.method == 'POST':
        gato.nombre = request.form.get('nombre')
        gato.descripcion = request.form.get('descripcion')
        gato.edad_meses = int(request.form.get('edad_meses') or 0)
        gato.imagenUrl = request.form.get('imagenUrl')
        db.session.commit()
        flash('Gato actualizado correctamente', 'success')
        return redirect(url_for('admin_gatos'))
    return render_template('admin/gato_form.html', gato=gato)

@app.route('/admin/usuarios')
@login_required
def admin_usuarios():
    if current_user.rol != 'admin':
        return redirect(url_for('index'))
    usuarios = Usuario.query.all()
    return render_template('admin/usuarios.html', usuarios=usuarios)

@app.route('/')
def index():
    cats = Gato.query.filter_by(adoptado=False).limit(3).all()
    products = Producto.query.filter(Producto.categoria.in_(['suplemento'])).limit(3).all()
    return render_template('index.html', gatos=cats, suplementos=products)

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
    app.run(debug=True)
