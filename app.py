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

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///catfeteria.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

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
