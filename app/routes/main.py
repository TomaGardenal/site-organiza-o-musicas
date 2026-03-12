from flask import Blueprint, send_from_directory
import os

main_bp = Blueprint('main', __name__)


@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def index(path):
    static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
    return send_from_directory(static_folder, 'index.html')
