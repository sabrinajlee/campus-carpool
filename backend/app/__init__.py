from flask import Flask
from flask_cors import CORS

from config import Config
from app.extensions import db, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so Flask-Migrate can see them
    from app import models  # noqa: F401

    from app.api import api_bp

    app.register_blueprint(api_bp, url_prefix="/api")

    return app
