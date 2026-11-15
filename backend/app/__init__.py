from flask import Flask
from flask_cors import CORS

from config import Config
from app.errors import error_response
from app.extensions import db, login_manager, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Import models so Flask-Migrate can see them
    from app import models

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(models.User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        # API: return JSON 401 instead of redirecting to a login page
        return error_response(401, "NOT_LOGGED_IN", "Please log in first.")

    from app.api import api_bp
    from app.auth import auth_bp

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app
