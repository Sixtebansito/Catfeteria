import os
import sys
import traceback
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, abort

# Top-level entrypoint required by Vercel @vercel/python
app = Flask(__name__)
application = app

STARTUP_ERROR = None
try:
    from dotenv import load_dotenv
    load_dotenv()

    app.secret_key = os.environ.get('SECRET_KEY', 'catfeteria_app_secret_key_change_in_prod')

    # Configure database
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:////tmp/catfeteria.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    from models import db, Producto, Gato, Usuario, SolicitudAdopcion, Pedido, PedidoItem
    from flask_login import LoginManager, login_user, logout_user, login_required, current_user
    from werkzeug.security import generate_password_hash, check_password_hash
    from seed import seed_database, get_initial_products, get_initial_cats

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    @login_manager.user_loader
    def load_user(user_id):
        try:
            return Usuario.query.get(int(user_id))
        except Exception:
            return None

    def admin_required(f):
        @wraps(f)
        @login_required
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.rol != 'admin':
                flash("Acceso restringido a administradores.", "error")
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function

    def get_safe_cafes():
        try:
            cafes = Producto.query.filter(Producto.categoria.in_(['cafe', 'postre'])).all()
            if cafes:
                return cafes
        except Exception:
            try:
                db.session.rollback()
            except Exception:
                pass
        return [p for p in get_initial_products() if p.categoria in ['cafe', 'postre']]

    def get_safe_suplementos():
        try:
            suplementos = Producto.query.filter(Producto.categoria.in_(['suplemento', 'accesorio'])).all()
            if suplementos:
                return suplementos
        except Exception:
            try:
                db.session.rollback()
            except Exception:
                pass
        return [p for p in get_initial_products() if p.categoria in ['suplemento', 'accesorio']]

    def get_safe_gatos():
        try:
            gatos = Gato.query.filter_by(adoptado=False).all()
            if gatos:
                return gatos
        except Exception:
            try:
                db.session.rollback()
            except Exception:
                pass
        return get_initial_cats()

    @app.route('/health')
    def health():
        return {
            "status": "healthy",
            "python": sys.version,
            "has_db_url": bool(database_url)
        }, 200

    @app.route('/setup-db', methods=['GET', 'POST'])
    def setup_db():
        try:
            force = request.args.get('force', 'false').lower() == 'true'
            seed_database(force=force)
            flash("¡Base de datos y catálogo sincronizados con éxito!", "success")
            return redirect(url_for('index'))
        except Exception as e:
            try:
                db.session.rollback()
            except Exception:
                pass
            return f"Error al inicializar la base de datos: {e}", 500

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
            
        if request.method == 'POST':
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '').strip()
            try:
                user = Usuario.query.filter_by(username=username).first()
                if user and check_password_hash(user.password, password):
                    login_user(user)
                    flash(f"¡Bienvenido de vuelta, {user.nombre}!", "success")
                    if user.rol == 'admin':
                        return redirect(url_for('admin_dashboard'))
                    return redirect(url_for('index'))
            except Exception:
                db.session.rollback()
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
        try:
            total_productos = Producto.query.count()
            total_gatos = Gato.query.count()
            total_usuarios = Usuario.query.count()
        except Exception:
            db.session.rollback()
            total_productos, total_gatos, total_usuarios = 0, 0, 0
        return render_template(
            'admin/dashboard.html',
            total_productos=total_productos,
            total_gatos=total_gatos,
            total_usuarios=total_usuarios
        )

    @app.route('/admin/productos')
    @admin_required
    def admin_productos():
        try:
            productos = Producto.query.all()
        except Exception:
            db.session.rollback()
            productos = get_initial_products()
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
        try:
            gatos = Gato.query.all()
        except Exception:
            db.session.rollback()
            gatos = get_initial_cats()
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
        try:
            usuarios = Usuario.query.all()
        except Exception:
            db.session.rollback()
            usuarios = []
        return render_template('admin/usuarios.html', usuarios=usuarios)

    @app.route('/')
    def index():
        cats = get_safe_gatos()[:4]
        products = get_safe_suplementos()[:4]
        cafes = get_safe_cafes()[:4]
        return render_template('index.html', gatos=cats, suplementos=products, cafes=cafes)

    @app.route('/menu')
    def menu():
        cafes = get_safe_cafes()
        return render_template('menu.html', cafes=cafes)

    @app.route('/suplementos')
    def suplementos():
        productos = get_safe_suplementos()
        return render_template('suplementos.html', suplementos=productos)

    @app.route('/adopciones')
    def adopciones():
        gatos = get_safe_gatos()
        return render_template('adopciones.html', gatos=gatos)

    @app.route('/cuenta')
    def cuenta():
        return render_template('cuenta.html')

    @app.errorhandler(404)
    def page_not_found(e):
        return redirect(url_for('index'))

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        if request.args.get('debug') == '1':
            return f"<h1>Error 500</h1><pre>{traceback.format_exc()}</pre>", 500
        cats = get_safe_gatos()[:4]
        products = get_safe_suplementos()[:4]
        cafes = get_safe_cafes()[:4]
        return render_template('index.html', gatos=cats, suplementos=products, cafes=cafes), 200

except Exception:
    STARTUP_ERROR = traceback.format_exc()

_original_wsgi = app.wsgi_app

def _safe_wsgi(environ, start_response):
    if STARTUP_ERROR:
        start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
        html = f"""<!DOCTYPE html>
<html>
<head><title>Catfetería - Diagnóstico de Inicio</title></head>
<body style="font-family: monospace; padding: 30px; background: #1a1a1a; color: #ff6b6b; line-height: 1.5;">
    <h1 style="color: #ff8787;">Catfetería - Error durante Startup en Vercel</h1>
    <p>Se produjo una excepción durante la inicialización de módulos en Python:</p>
    <pre style="background: #2b2b2b; padding: 20px; border-radius: 8px; color: #fff; overflow-x: auto;">{STARTUP_ERROR}</pre>
</body>
</html>"""
        return [html.encode('utf-8')]
    try:
        return _original_wsgi(environ, start_response)
    except Exception:
        err = traceback.format_exc()
        start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
        html = f"""<!DOCTYPE html>
<html>
<head><title>Catfetería - Error en Solicitud</title></head>
<body style="font-family: monospace; padding: 30px; background: #1a1a1a; color: #feca57; line-height: 1.5;">
    <h1 style="color: #ff9f43;">Catfetería - Error en Ejecución WSGI</h1>
    <pre style="background: #2b2b2b; padding: 20px; border-radius: 8px; color: #fff; overflow-x: auto;">{err}</pre>
</body>
</html>"""
        return [html.encode('utf-8')]

app.wsgi_app = _safe_wsgi

if __name__ == '__main__':
    app.run(debug=True, port=5000)
