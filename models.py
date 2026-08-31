from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

from flask_login import UserMixin

class Usuario(db.Model, UserMixin):
    __tablename__ = 'Usuario'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(50), default='cliente')
    fechaRegistro = db.Column(db.DateTime, default=datetime.utcnow)

    pedidos = db.relationship('Pedido', backref='usuario', lazy=True)
    solicitudes = db.relationship('SolicitudAdopcion', backref='usuario', lazy=True)

class Producto(db.Model):
    __tablename__ = 'Producto'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(50), nullable=False) # 'cafe', 'postre', 'suplemento', 'accesorio'
    imagenUrl = db.Column(db.String(255), nullable=True)
    activo = db.Column(db.Boolean, default=True)

    pedidoItems = db.relationship('PedidoItem', backref='producto', lazy=True)

class Gato(db.Model):
    __tablename__ = 'Gato'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    edad_meses = db.Column(db.Integer, nullable=True)
    imagenUrl = db.Column(db.String(255), nullable=True)
    adoptado = db.Column(db.Boolean, default=False)

    solicitudes = db.relationship('SolicitudAdopcion', backref='gato', lazy=True)

class SolicitudAdopcion(db.Model):
    __tablename__ = 'SolicitudAdopcion'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuarioId = db.Column(db.Integer, db.ForeignKey('Usuario.id'), nullable=False)
    gatoId = db.Column(db.Integer, db.ForeignKey('Gato.id'), nullable=False)
    razon = db.Column(db.Text, nullable=False)
    telefono = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(50), default='Pendiente') # Pendiente, Aprobado, Rechazado
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Pedido(db.Model):
    __tablename__ = 'Pedido'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), default='Pendiente') # Pendiente, Completado
    telefono = db.Column(db.String(50), nullable=False)
    usuarioId = db.Column(db.Integer, db.ForeignKey('Usuario.id'), nullable=True) # allow guests? or require users
    items = db.relationship('PedidoItem', backref='pedido', lazy=True)

class PedidoItem(db.Model):
    __tablename__ = 'PedidoItem'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precioUn = db.Column(db.Float, nullable=False)
    pedidoId = db.Column(db.Integer, db.ForeignKey('Pedido.id'), nullable=False)
    productoId = db.Column(db.Integer, db.ForeignKey('Producto.id'), nullable=False)
