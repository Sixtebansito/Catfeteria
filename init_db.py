from app import app
from models import db
from seed import seed_database

def init():
    with app.app_context():
        db.create_all()
        seed_database(force=False)
        print("Database tables created and initialized.")

if __name__ == "__main__":
    init()
