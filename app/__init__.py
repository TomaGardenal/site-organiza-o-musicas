import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    app = Flask(__name__,
                template_folder=os.path.join(base_dir, 'templates'),
                static_folder=os.path.join(base_dir, 'static'))

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///music_manager.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'app/static/uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 52428800))

    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize background scheduler
    from app.services.scheduler import start_scheduler
    start_scheduler(app)


    from app.models import Project, Track, MarketingPost  # noqa

    from app.routes.main import main_bp
    from app.routes.projects import projects_bp
    from app.routes.tracks import tracks_bp
    from app.routes.marketing import marketing_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.uploads import uploads_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(tracks_bp, url_prefix='/api/tracks')
    app.register_blueprint(marketing_bp, url_prefix='/api/marketing')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')

    with app.app_context():
        db.create_all()

    return app
