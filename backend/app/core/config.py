"""
Archivo: backend/app/core/config.py
Función: Carga las variables de entorno (.env) y expone la configuración global del sistema.
"""
from dotenv import load_dotenv

load_dotenv()

import os


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
SESSION_COOKIE_SECURE = _env_bool("SESSION_COOKIE_SECURE", False)
APP_ENCRYPTION_KEY = os.environ.get("APP_ENCRYPTION_KEY", "").strip()
APP_TIMEZONE = os.environ.get("APP_TIMEZONE", "America/Lima").strip() or "America/Lima"

CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]

MIKROTIK_TIMEOUT = float(os.environ.get("MIKROTIK_TIMEOUT", "6"))
MIKROTIK_CUT_LIST = os.environ.get("MIKROTIK_CUT_LIST", "morosos")

# Contacto comercial de licencias.
ZHUB_LICENSE_WHATSAPP = os.environ.get("ZHUB_LICENSE_WHATSAPP", "").strip()
ZHUB_LICENSE_PAYMENT_URL = os.environ.get("ZHUB_LICENSE_PAYMENT_URL", "").strip()

# Etapa 6/7 — License Server remoto. Si URL o clave pública no están configurados,
# Z-Hub conserva temporalmente el motor local de compatibilidad.
ZHUB_LICENSE_SERVER_URL = os.environ.get("ZHUB_LICENSE_SERVER_URL", "").strip()
ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE = os.environ.get(
    "ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE", "/etc/zhub/licencia/server-public.pem"
).strip()
ZHUB_LICENSE_CACHE_FILE = os.environ.get(
    "ZHUB_LICENSE_CACHE_FILE", "/var/lib/zhub/license/authorization.jwt"
).strip()
ZHUB_LICENSE_SERVER_TIMEOUT = float(os.environ.get("ZHUB_LICENSE_SERVER_TIMEOUT", "5"))
ZHUB_LICENSE_SERVER_ISSUER = os.environ.get("ZHUB_LICENSE_SERVER_ISSUER", "zhub-license-server").strip()
ZHUB_LICENSE_SERVER_AUDIENCE = os.environ.get("ZHUB_LICENSE_SERVER_AUDIENCE", "zhub-installation").strip()
