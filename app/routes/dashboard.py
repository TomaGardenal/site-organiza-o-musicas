from flask import Blueprint, jsonify
from app.models import Project, Track, MarketingPost

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/', methods=['GET'])
def get_dashboard():
    total_projects = Project.query.count()
    total_tracks = Track.query.count()
    total_posts = MarketingPost.query.count()

    # Projects by status
    project_statuses = {}
    for p in Project.query.all():
        project_statuses[p.status] = project_statuses.get(p.status, 0) + 1

    # Tracks by status
    track_statuses = {}
    for t in Track.query.all():
        track_statuses[t.status] = track_statuses.get(t.status, 0) + 1

    # Posts by status
    post_statuses = {}
    for m in MarketingPost.query.all():
        post_statuses[m.status] = post_statuses.get(m.status, 0) + 1

    # Projects by type
    project_types = {}
    for p in Project.query.all():
        project_types[p.project_type] = project_types.get(p.project_type, 0) + 1

    # Recent projects (last 5)
    recent_projects = Project.query.order_by(Project.created_at.desc()).limit(5).all()

    return jsonify({
        'total_projects': total_projects,
        'total_tracks': total_tracks,
        'total_posts': total_posts,
        'project_statuses': project_statuses,
        'track_statuses': track_statuses,
        'post_statuses': post_statuses,
        'project_types': project_types,
        'recent_projects': [p.to_dict() for p in recent_projects],
    })
