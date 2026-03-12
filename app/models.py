from datetime import datetime
from app import db


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    project_type = db.Column(db.String(50), nullable=False)  # Single, EP, Mixtape, Album
    description = db.Column(db.Text, default='')
    release_date = db.Column(db.String(20), default='')
    cover_image = db.Column(db.String(500), default='')
    status = db.Column(db.String(50), default='em produção')  # em produção, finalizado, lançado
    genre_tags = db.Column(db.String(300), default='')  # comma-separated
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tracks = db.relationship('Track', backref='project', lazy=True, cascade='all, delete-orphan')
    marketing_posts = db.relationship('MarketingPost', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'project_type': self.project_type,
            'description': self.description,
            'release_date': self.release_date,
            'cover_image': self.cover_image,
            'status': self.status,
            'genre_tags': self.genre_tags.split(',') if self.genre_tags else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'track_count': len(self.tracks),
            'post_count': len(self.marketing_posts),
        }


class Track(db.Model):
    __tablename__ = 'tracks'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    lyrics = db.Column(db.Text, default='')
    beat_file = db.Column(db.String(500), default='')   # uploaded file URL
    beat_link = db.Column(db.String(500), default='')   # external link
    notes = db.Column(db.Text, default='')
    status = db.Column(db.String(50), default='em produção')  # em produção, gravada, mixagem, finalizada
    track_number = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'lyrics': self.lyrics,
            'beat_file': self.beat_file,
            'beat_link': self.beat_link,
            'notes': self.notes,
            'status': self.status,
            'track_number': self.track_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class MarketingPost(db.Model):
    __tablename__ = 'marketing_posts'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # Instagram, TikTok, YouTube, Twitter, etc.
    caption = db.Column(db.Text, default='')
    planned_date = db.Column(db.String(20), default='')
    media_file = db.Column(db.String(500), default='')
    status = db.Column(db.String(50), default='ideia')  # ideia, pronto, publicado
    idea_notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'platform': self.platform,
            'caption': self.caption,
            'planned_date': self.planned_date,
            'media_file': self.media_file,
            'status': self.status,
            'idea_notes': self.idea_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
