from flask import Blueprint, current_app, jsonify, redirect, request
from flask_login import current_user, login_required, login_user, logout_user
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.email import send_verification_email
from app.errors import error_response
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)

VERIFY_SALT = "email-verify"


# ---------- helpers ----------

def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=VERIFY_SALT)


def _make_verify_link(user):
    token = _serializer().dumps(user.id)
    return f"{current_app.config['BACKEND_URL']}/api/auth/verify/{token}"


def _is_allowed_domain(email):
    domain = email.rsplit("@", 1)[-1]
    return domain in current_app.config["ALLOWED_EMAIL_DOMAINS"]


def _json_body():
    return request.get_json(silent=True) or {}


# ---------- routes ----------

@auth_bp.post("/signup")
def signup():
    data = _json_body()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return error_response(400, "MISSING_FIELDS", "Name, email and password are required.")
    if "@" not in email or not _is_allowed_domain(email):
        allowed = ", ".join("@" + d for d in current_app.config["ALLOWED_EMAIL_DOMAINS"])
        return error_response(400, "INVALID_EMAIL_DOMAIN", f"Please use your school email ({allowed}).")
    if len(password) < current_app.config["MIN_PASSWORD_LENGTH"]:
        return error_response(
            400,
            "WEAK_PASSWORD",
            f"Password must be at least {current_app.config['MIN_PASSWORD_LENGTH']} characters.",
        )
    if User.query.filter_by(email=email).first():
        return error_response(409, "EMAIL_TAKEN", "An account with this email already exists.")

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    send_verification_email(user.email, _make_verify_link(user))
    return jsonify({"message": "Account created. Check your email to verify it.", "email": user.email}), 201


@auth_bp.get("/verify/<token>")
def verify(token):
    """Opened from the email link. Redirects to the frontend login page with a result."""
    login_url = f"{current_app.config['FRONTEND_ORIGIN']}/login"
    try:
        user_id = _serializer().loads(token, max_age=current_app.config["VERIFY_TOKEN_MAX_AGE"])
    except SignatureExpired:
        return redirect(f"{login_url}?verify=expired")
    except BadSignature:
        return redirect(f"{login_url}?verify=invalid")

    user = db.session.get(User, user_id)
    if user is None:
        return redirect(f"{login_url}?verify=invalid")

    if not user.is_verified:
        user.is_verified = True
        db.session.commit()
    return redirect(f"{login_url}?verify=success")


@auth_bp.post("/resend")
def resend():
    email = (_json_body().get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    if user and not user.is_verified:
        send_verification_email(user.email, _make_verify_link(user))
    # Same answer whether or not the account exists, so nobody can check which emails are registered
    return jsonify({"message": "If that account needs verifying, a new link has been sent."}), 200


@auth_bp.post("/login")
def login():
    data = _json_body()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return error_response(401, "INVALID_CREDENTIALS", "Invalid email or password.")
    if not user.is_verified:
        return error_response(403, "EMAIL_NOT_VERIFIED", "Please verify your email before logging in.")

    login_user(user)
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out."}), 200


@auth_bp.get("/me")
@login_required
def me():
    return jsonify({"user": current_user.to_dict()}), 200
