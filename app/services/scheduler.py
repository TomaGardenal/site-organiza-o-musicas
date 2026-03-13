from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import os

# We will move the actual check function here later
# The scheduler needs the flask app context to read the DB

def check_scheduled_posts(app):
    from app import db
    from app.models import MarketingPost
    from app.services.social_poster import execute_post
    
    with app.app_context():
        now = datetime.utcnow()
        # Find posts that are 'pronto' (ready)
        posts_to_publish = MarketingPost.query.filter_by(status='pronto').all()
        
        for post in posts_to_publish:
            try:
                # `planned_date` is a string like "2023-10-25T14:30"
                if post.planned_date:
                    planned_time = datetime.fromisoformat(post.planned_date)
                    
                    if now >= planned_time:
                        print(f"[{datetime.now()}] TIME TO POST: {post.id} to {post.platform}")
                        post.status = 'postando...'
                        db.session.commit()
                        
                        # Call the automation script
                        success, message = execute_post(post)
                        
                        if success:
                            post.status = 'publicado'
                        else:
                            post.status = 'erro'
                            post.idea_notes = f"[ERRO] {message}\n" + (post.idea_notes or "")
                            
                        db.session.commit()
            except Exception as e:
                print(f"Error checking post {post.id}: {str(e)}")


def start_scheduler(app):
    scheduler = BackgroundScheduler()
    
    # Check every 1 minute
    scheduler.add_job(
        func=check_scheduled_posts,
        trigger=IntervalTrigger(minutes=1),
        args=[app],
        id='social_media_poster_job',
        name='Check for scheduled social media posts every minute',
        replace_existing=True
    )
    
    scheduler.start()
    return scheduler
