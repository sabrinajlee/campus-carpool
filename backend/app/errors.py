from flask import jsonify


def error_response(status, code, message):
    """Every API error uses the same shape: {"error": {"code": ..., "message": ...}}"""
    return jsonify({"error": {"code": code, "message": message}}), status
