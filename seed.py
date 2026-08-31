from app import app
from models import db, Producto, Gato

def seed_data():
    with app.app_context():
        # Clear existing data for a clean seed
        Producto.query.delete()
        Gato.query.delete()

        # Productos - Café y Postres
        cafes = [
            Producto(titulo="Café Espresso", descripcion="Un clásico intenso y aromático.", precio=2.50, categoria="cafe", imagenUrl="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80"),
            Producto(titulo="Café Latte", descripcion="Suave mezcla de espresso y leche vaporizada.", precio=3.50, categoria="cafe", imagenUrl="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80"),
            Producto(titulo="Café Mocha", descripcion="Un espresso con un toque de chocolate.", precio=4.00, categoria="cafe", imagenUrl="https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80"),
        ]

        # Productos - Suplementos
        suplementos = [
            Producto(titulo="Arena de Gatos", descripcion="4kg de la mejor arena para tu gato", precio=9.99, categoria="suplemento", imagenUrl="https://images.unsplash.com/photo-1593466144883-7d9fc84bf321?w=500&q=80"), # cat litter box related
            Producto(titulo="Juguete Interactivo Láser", descripcion="Estimula la mente y el cuerpo de tu gato.", precio=14.99, categoria="accesorio", imagenUrl="https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&q=80"), # cat playing
            Producto(titulo="Comida para Gatos", descripcion="Mejora la salud de la piel y el pelaje. 5kg", precio=12.99, categoria="suplemento", imagenUrl="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80"), # cat food
        ]

        # Gatos para adopción
        gatos = [
            Gato(nombre="Oreo", descripcion="Un gato muy jugueton y listo para un hogar", edad_meses=12, imagenUrl="https://images.unsplash.com/photo-1513245543132-31f507417b26?w=500&q=80"),
            Gato(nombre="Milo", descripcion="Un gato cariñoso que busca una familia amorosa", edad_meses=24, imagenUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80"),
            Gato(nombre="Chetto", descripcion="Un gato muy cariño que busca un hogar", edad_meses=6, imagenUrl="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80"),
        ]

        db.session.bulk_save_objects(cafes)
        db.session.bulk_save_objects(suplementos)
        db.session.bulk_save_objects(gatos)

        db.session.commit()
        print("Database seeded with Unsplash images successfully!")

if __name__ == "__main__":
    seed_data()
