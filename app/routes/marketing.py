from flask import Blueprint, jsonify, request
from app import db
from app.models import MarketingPost

marketing_bp = Blueprint('marketing', __name__)


@marketing_bp.route('/project/<int:project_id>', methods=['GET'])
def list_posts(project_id):
    posts = MarketingPost.query.filter_by(project_id=project_id).order_by(MarketingPost.planned_date).all()
    return jsonify([p.to_dict() for p in posts])


@marketing_bp.route('/', methods=['POST'])
def create_post():
    data = request.get_json()
    post = MarketingPost(
        project_id=data.get('project_id'),
        platform=data.get('platform', 'Instagram'),
        caption=data.get('caption', ''),
        planned_date=data.get('planned_date', ''),
        media_file=data.get('media_file', ''),
        status=data.get('status', 'ideia'),
        idea_notes=data.get('idea_notes', ''),
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@marketing_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = MarketingPost.query.get_or_404(post_id)
    return jsonify(post.to_dict())


@marketing_bp.route('/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    post = MarketingPost.query.get_or_404(post_id)
    data = request.get_json()
    post.platform = data.get('platform', post.platform)
    post.caption = data.get('caption', post.caption)
    post.planned_date = data.get('planned_date', post.planned_date)
    post.media_file = data.get('media_file', post.media_file)
    post.status = data.get('status', post.status)
    post.idea_notes = data.get('idea_notes', post.idea_notes)
    db.session.commit()
    return jsonify(post.to_dict())


@marketing_bp.route('/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = MarketingPost.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'}), 200
