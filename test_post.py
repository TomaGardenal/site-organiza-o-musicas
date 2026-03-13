from app import create_app, db
from app.models import Project, MarketingPost
from datetime import datetime
import time

app = create_app()

with app.app_context():
    print("Criando projeto de teste...")
    proj = Project.query.first()
    if not proj:
        proj = Project(name="Test Project", project_type="Single", status="em produção")
        db.session.add(proj)
        db.session.commit()
    
    # Create a post scheduled for 5 seconds ago
    print(f"Criando post de teste para o Instagram para o projeto: {proj.id}")
    now_iso = datetime.utcnow().isoformat()[:16] # e.g. 2026-03-13T17:40
    
    post = MarketingPost(
        project_id=proj.id,
        platform="Instagram",
        caption="Isso é um teste do meu robô!",
        planned_date=now_iso, 
        status="pronto",        # The scheduler searches for 'pronto'
        media_file="/uploads/test_image.jpg"
    )
    db.session.add(post)
    db.session.commit()
    print("Post criado com sucesso! Status: 'pronto'.")
    print("O agendador de tarefas Flask deve pegá-lo dentro de 1 minuto.")
