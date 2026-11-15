import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5001")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://localhost:5432/campus_carpool"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Auth
    ALLOWED_EMAIL_DOMAINS = [
        d.strip().lower()
        for d in os.getenv("ALLOWED_EMAIL_DOMAINS", "uwo.ca").split(",")
        if d.strip()
    ]
    VERIFY_TOKEN_MAX_AGE = 60 * 60 * 24  # 24 hours, in seconds
    MIN_PASSWORD_LENGTH = 8

    # Session cookie. Lax works locally (localhost:5173 -> localhost:5001 is the same site).
    # When frontend and backend are deployed on different domains, set
    # SESSION_COOKIE_SAMESITE=None and SESSION_COOKIE_SECURE=1 in the host's env vars.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "0") == "1"
