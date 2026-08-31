import os
from flask import Flask, render_template, request, redirect, url_for, flash
from dotenv import load_dotenv
from models import db, Producto, Gato

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

@app.route('/setup-db')
def setup_db():
    # Creamos las tablas
    db.create_all()
    
    # Limpiamos si hay datos viejos
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

@app.route('/')
def index():
    # Fetch a few products and cats for the index page if needed
    cats = Gato.query.filter_by(adoptado=False).limit(3).all()
    products = Producto.query.filter(Producto.categoria.in_(['suplemento'])).limit(3).all()
    return render_template('index.html', gatos=cats, suplementos=products)

@app.route('/menu')
def menu():
    # Fetch menu items
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
