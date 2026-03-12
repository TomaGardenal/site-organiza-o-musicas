import os
from flask import Blueprint, send_from_directory, current_app

main_bp = Blueprint('main', __name__)


@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def index(path):
    # Let Flask handle /static/ files natively — only catch SPA routes
    static_folder = os.path.join(current_app.root_path, 'static')
    return send_from_directory(static_folder, 'index.html')
