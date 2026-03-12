from flask import Blueprint, jsonify, request
from app import db
from app.models import Project

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('/', methods=['GET'])
def list_projects():
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])


@projects_bp.route('/', methods=['POST'])
def create_project():
    data = request.get_json()
    project = Project(
        name=data.get('name', ''),
        project_type=data.get('project_type', 'Single'),
        description=data.get('description', ''),
        release_date=data.get('release_date', ''),
        cover_image=data.get('cover_image', ''),
        status=data.get('status', 'em produção'),
        genre_tags=','.join(data.get('genre_tags', [])),
    )
    db.session.add(project)
    db.session.commit()
    return jsonify(project.to_dict()), 201


@projects_bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = project.to_dict()
    data['tracks'] = [t.to_dict() for t in project.tracks]
    data['marketing_posts'] = [m.to_dict() for m in project.marketing_posts]
    return jsonify(data)


@projects_bp.route('/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    project.name = data.get('name', project.name)
    project.project_type = data.get('project_type', project.project_type)
    project.description = data.get('description', project.description)
    project.release_date = data.get('release_date', project.release_date)
    project.cover_image = data.get('cover_image', project.cover_image)
    project.status = data.get('status', project.status)
    if 'genre_tags' in data:
        project.genre_tags = ','.join(data['genre_tags'])
    db.session.commit()
    return jsonify(project.to_dict())


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted'}), 200
