from flask import Blueprint, jsonify, request
from app import db
from app.models import Track

tracks_bp = Blueprint('tracks', __name__)


@tracks_bp.route('/project/<int:project_id>', methods=['GET'])
def list_tracks(project_id):
    tracks = Track.query.filter_by(project_id=project_id).order_by(Track.track_number).all()
    return jsonify([t.to_dict() for t in tracks])


@tracks_bp.route('/', methods=['POST'])
def create_track():
    data = request.get_json()
    track = Track(
        project_id=data.get('project_id'),
        title=data.get('title', ''),
        lyrics=data.get('lyrics', ''),
        beat_file=data.get('beat_file', ''),
        beat_link=data.get('beat_link', ''),
        notes=data.get('notes', ''),
        status=data.get('status', 'em produção'),
        track_number=data.get('track_number', 0),
    )
    db.session.add(track)
    db.session.commit()
    return jsonify(track.to_dict()), 201


@tracks_bp.route('/<int:track_id>', methods=['GET'])
def get_track(track_id):
    track = Track.query.get_or_404(track_id)
    return jsonify(track.to_dict())


@tracks_bp.route('/<int:track_id>', methods=['PUT'])
def update_track(track_id):
    track = Track.query.get_or_404(track_id)
    data = request.get_json()
    track.title = data.get('title', track.title)
    track.lyrics = data.get('lyrics', track.lyrics)
    track.beat_file = data.get('beat_file', track.beat_file)
    track.beat_link = data.get('beat_link', track.beat_link)
    track.notes = data.get('notes', track.notes)
    track.status = data.get('status', track.status)
    track.track_number = data.get('track_number', track.track_number)
    db.session.commit()
    return jsonify(track.to_dict())


@tracks_bp.route('/<int:track_id>', methods=['DELETE'])
def delete_track(track_id):
    track = Track.query.get_or_404(track_id)
    db.session.delete(track)
    db.session.commit()
    return jsonify({'message': 'Track deleted'}), 200
