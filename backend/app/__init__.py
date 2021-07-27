from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
load_dotenv()


def create_app(test_config=None):
    app = Flask(__name__)

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        "SQLALCHEMY_DATABASE_URI")

    from app.models.state import State
    from app.models.county import County

    db.init_app(app)
    migrate.init_app(app, db)

    from .routes import hello_world_bp
    app.register_blueprint(hello_world_bp)

    from .routes import states_bp
    app.register_blueprint(states_bp)

    return app
