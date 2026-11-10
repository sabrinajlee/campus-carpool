from flask import Flask
from flask_cors import CORS

from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)

    from app.api import api_bp

    app.register_blueprint(api_bp, url_prefix="/api")

    return app
