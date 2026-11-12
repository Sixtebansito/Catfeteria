import os
from models import db, Producto, Gato, Usuario
from werkzeug.security import generate_password_hash

def get_initial_products():
    cafes = [
        Producto(
            titulo="Café Espresso Clásico",
            descripcion="Intenso, aromático y con notas sutiles de avellana. Preparado con granos de altura de Loja.",
            precio=2.50,
            categoria="cafe",
            imagenUrl="/static/Imagenes/Menu y Promos/espresso.jpg"
        ),
        Producto(
            titulo="Café Latte Aterciopelado",
            descripcion="Suave mezcla equilibrada de espresso doble y leche vaporizada con microespuma sedosa.",
            precio=3.50,
            categoria="cafe",
            imagenUrl="/static/Imagenes/Menu y Promos/latte.jpeg"
        ),
        Producto(
            titulo="Café Mocha Felino",
            descripcion="Espresso premium combinado con chocolate semi-amargo artesanal y crema batida.",
            precio=4.00,
            categoria="cafe",
            imagenUrl="/static/Imagenes/Menu y Promos/mocha.jpg"
        ),
        Producto(
            titulo="Catpuccino con Arte Latte",
            descripcion="Capuchino cremoso decorado a mano con arte latte en forma de carita o huella de gato.",
            precio=3.75,
            categoria="cafe",
            imagenUrl="/static/Imagenes/Menu y Promos/cappuccino.jpg"
        ),
        Producto(
            titulo="Cold Brew Especial 18h",
            descripcion="Extracción en frío durante 18 horas. Bebida dulce, refrescante y con baja acidez.",
            precio=3.80,
            categoria="cafe",
            imagenUrl="/static/Imagenes/Menu y Promos/coldbrew.jpg"
        ),
        Producto(
            titulo="Matcha Latte Ceremonial",
            descripcion="Té matcha orgánico japonés batido al momento con leche vaporizada a tu elección.",
            precio=4.25,
            categoria="cafe",
            imagenUrl="/static/Imagenes/Menu y Promos/matcha.jpg"
        ),
        Producto(
            titulo="Cheesecake de Frutos Rojos",
            descripcion="Tarta de queso estilo New York horneada con coulis artesanal de moras andinas y arándanos.",
            precio=4.50,
            categoria="postre",
            imagenUrl="/static/Imagenes/Menu y Promos/cheesecake.jpg"
        ),
        Producto(
            titulo="Croissant Artesanal de Mantequilla",
            descripcion="Hojaldre crujiente y dorado elaborado diariamente con 100% mantequilla pura.",
            precio=2.75,
            categoria="postre",
            imagenUrl="/static/Imagenes/Menu y Promos/croissant.jpg"
        ),
        Producto(
            titulo="Brownie Tibio con Helado",
            descripcion="Delicioso brownie de chocolate oscuro con nueces, servido tibio con helado de vainilla.",
            precio=4.00,
            categoria="postre",
            imagenUrl="/static/Imagenes/Menu y Promos/brownie.jpg"
        )
    ]

    suplementos = [
        Producto(
            titulo="Arena Sanitaria Aglomerante 4kg",
            descripcion="Bentonita 100% natural con carbón activado para máximo control de olores y fácil limpieza.",
            precio=9.99,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/arena.jpg"
        ),
        Producto(
            titulo="Juguete Láser Interactivo Automático",
            descripcion="Láser inteligente con rotación de 360 grados para ejercitar y divertir a tu gato en casa.",
            precio=14.99,
            categoria="accesorio",
            imagenUrl="/static/Imagenes/Suplementos/laser.webp"
        ),
        Producto(
            titulo="Alimento Balanceado Premium 5kg",
            descripcion="Fórmula completa con taurina, omega 3 y vitaminas esenciales para gatos de todas las edades.",
            precio=18.50,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/comida.webp"
        ),
        Producto(
            titulo="Purina Pro Plan Sterilized 3kg",
            descripcion="Nutrición avanzada con tecnología OptiRenal que protege la salud urinaria y controla el peso.",
            precio=28.00,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/Proplan.jpg"
        ),
        Producto(
            titulo="Royal Canin FIT 32 4kg",
            descripcion="Alimento equilibrado formulado con antioxidantes para gatos adultos con actividad moderada.",
            precio=32.50,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/FIT.jpg"
        ),
        Producto(
            titulo="Mirrapel Oleoso Piel & Pelaje 250ml",
            descripcion="Suplemento vitamínico líquido con ácidos grasos esenciales para detener la caída del pelo.",
            precio=16.00,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/Mirrapel.jpg"
        ),
        Producto(
            titulo="Glicopan Pet Reconstituyente 125ml",
            descripcion="Estimulante del apetito y revitalizante para gatos convalecientes o en crecimiento.",
            precio=14.50,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/Glicopan.jpg"
        ),
        Producto(
            titulo="Mamistop Leche Maternizada 250g",
            descripcion="Sustituto lácteo en polvo formulado especialmente para la crianza de gatitos huérfanos.",
            precio=19.99,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/Mamistop.jpg"
        ),
        Producto(
            titulo="Snacks Amigo Delicias Felinas",
            descripcion="Premios crocantes rellenos de crema con auténtico sabor a salmón y catnip natural.",
            precio=4.50,
            categoria="suplemento",
            imagenUrl="/static/Imagenes/Suplementos/Amigo.png"
        ),
        Producto(
            titulo="Rascador Torre Multinivel con Hamaca",
            descripcion="Rascador robusto forrado en sisal natural con plataformas acolchadas y juguetes colgantes.",
            precio=45.00,
            categoria="accesorio",
            imagenUrl="/static/Imagenes/Suplementos/rascador.jpg"
        ),
        Producto(
            titulo="Cama Nido Relajante Felina",
            descripcion="Cama afelpada ergonómica ultrasuave diseñada para aliviar la ansiedad y brindar abrigo.",
            precio=22.00,
            categoria="accesorio",
            imagenUrl="/static/Imagenes/Suplementos/cama_gato.jpg"
        )
    ]

    return cafes + suplementos

def get_initial_cats():
    return [
        Gato(
            nombre="Chetto",
            descripcion="Un gatito rubio atigrado súper cariñoso, juguetón y lleno de energía. Le fascina perseguir pelotas.",
            edad_meses=6,
            imagenUrl="/static/Imagenes/Adopciones/Chetto.jpg"
        ),
        Gato(
            nombre="Milo",
            descripcion="Un caballero tranquilo y muy dulce. Disfruta tomar siestas al sol y recibir caricias tras las orejas.",
            edad_meses=24,
            imagenUrl="/static/Imagenes/Adopciones/Milo.jpg"
        ),
        Gato(
            nombre="Oreo",
            descripcion="Elegante gatita tuxedo de mirada tierna. Es muy sociable con otros gatos y una excelente compañera.",
            edad_meses=12,
            imagenUrl="/static/Imagenes/Adopciones/Oreo.jpg"
        ),
        Gato(
            nombre="Quemadito",
            descripcion="Gatito siamés rescatado con mucho amor. Es un dulce ronroneador que busca calor de hogar.",
            edad_meses=8,
            imagenUrl="/static/Imagenes/Adopciones/Quemadito.webp"
        ),
        Gato(
            nombre="Prometeo",
            descripcion="Curioso explorador de ojos brillantes. Le gusta estar en las alturas y vigilar la cafetería con calma.",
            edad_meses=18,
            imagenUrl="/static/Imagenes/Adopciones/Prometeo.jpeg"
        ),
        Gato(
            nombre="Chad",
            descripcion="Un felino noble, fuerte y muy protector. Es paciente con los niños y adora los mimos en el mentón.",
            edad_meses=14,
            imagenUrl="/static/Imagenes/Adopciones/GatoChad.jpg"
        ),
        Gato(
            nombre="Marto",
            descripcion="Joven travieso y sumamente divertido. Siempre está listo para un nuevo juego interactivo o un snack.",
            edad_meses=10,
            imagenUrl="/static/Imagenes/Adopciones/GatoMarto.jpeg"
        ),
        Gato(
            nombre="Shimaru",
            descripcion="Hermosa gatita tricolor calicó con personalidad tierna y ronroneos constantes cuando está en confianza.",
            edad_meses=7,
            imagenUrl="/static/Imagenes/Adopciones/GatoShimaru.jpeg"
        ),
        Gato(
            nombre="Shimaru Jr.",
            descripcion="Hermanita de Shimaru, juguetona, despierta y muy apegada a los humanos. Lista para llenar tu vida de alegría.",
            edad_meses=7,
            imagenUrl="/static/Imagenes/Adopciones/GatoShimaru2.jpeg"
        )
    ]

def seed_database(force=False):
    db.create_all()

    admin = Usuario.query.filter_by(username='admin').first()
    if not admin:
        admin = Usuario(
            nombre='Administrador Catfetería',
            username='admin',
            email='admin@catfeteria.com',
            password=generate_password_hash('admin', method='pbkdf2:sha256'),
            rol='admin'
        )
        db.session.add(admin)

    prod_count = Producto.query.count()
    gato_count = Gato.query.count()

    if force or prod_count == 0:
        if force:
            Producto.query.delete()
        for p in get_initial_products():
            db.session.add(p)

    if force or gato_count == 0:
        if force:
            Gato.query.delete()
        for g in get_initial_cats():
            db.session.add(g)

    db.session.commit()
    print("Database seeded with full products and adoptable cats successfully!")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        seed_database(force=True)
