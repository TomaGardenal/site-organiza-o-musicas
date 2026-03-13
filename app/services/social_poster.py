import os
from time import sleep

# Instagram API (Unofficial but robust)
from instagrapi import Client

# Playwright for Web Automation
from playwright.sync_api import sync_playwright

def execute_post(post):
    """
    Executes the post based on the target platform.
    Returns: (success_boolean, error_message_or_success_message)
    """
    platform = post.platform.lower()
    media_path = post.media_file
    caption = post.caption or ""
    
    # Ensure media is locally accessible
    base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    full_media_path = os.path.join(base_dir, 'static', media_path.lstrip('/'))
    
    print(f"Executing post for {platform}: Media={full_media_path}")
    
    if not os.path.exists(full_media_path):
        return False, f"Arquivo de mídia não encontrado: {full_media_path}"

    if 'instagram' in platform:
        return post_to_instagram(full_media_path, caption)
    elif 'tiktok' in platform:
        return post_to_tiktok(full_media_path, caption)
    elif 'youtube' in platform:
        return post_to_youtube(full_media_path, caption)
    elif 'x' in platform or 'twitter' in platform:
        return post_to_x(full_media_path, caption)
    else:
        return False, f"Plataforma '{platform}' não suportada ainda."


def get_credentials(platform):
    """
    Loads username/password from Environment variables.
    You will need to set these in your .env file!
    """
    user = os.getenv(f'{platform.upper()}_USER')
    password = os.getenv(f'{platform.upper()}_PASS')
    return user, password


def post_to_instagram(media_path, caption):
    username, password = get_credentials('INSTAGRAM')
    if not username or not password:
        return False, "Credenciais do Instagram não configuradas no .env"
        
    try:
        cl = Client()
        # To avoid being blocked, in a real app you'd save & load the session ID.
        cl.login(username, password)
        
        # Check if it's a video or image
        if media_path.lower().endswith(('.mp4', '.mov')):
            cl.video_upload(media_path, caption)
        else:
            cl.photo_upload(media_path, caption)
            
        return True, "Postado no Instagram com sucesso!"
    except Exception as e:
        return False, f"Erro no Instagram: {str(e)}"


# ==========================================
# Automação de Navegador (Opção A)
# Playwright simula que você está com o navegador aberto.
# ==========================================
def post_to_youtube(media_path, caption):
    # This is a simplified placeholder structure. Correct UI selectors require deep inspection.
    return False, "Automação do YouTube requer login da Conta do Google no perfil do Chromium."


def post_to_tiktok(media_path, caption):
    return False, "Automação do TikTok requer manter sessão de login ativa."


def post_to_x(media_path, caption):
    return False, "Automação do X ainda não integrada."
