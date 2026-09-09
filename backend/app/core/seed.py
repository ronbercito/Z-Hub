"""
Archivo: backend/app/core/seed.py
Función: Datos iniciales mínimos al arrancar: crea la fila de configuración por defecto.
         La cuenta administradora se crea únicamente desde el asistente de configuración inicial.
"""
import logging

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.setting import DEFAULT_SETTINGS, Setting
from app.models.user import User

logger = logging.getLogger("zhub.seed")


async def seed_initial_data():
    async with SessionLocal() as db:
        setting = await db.get(Setting, "system_config")
        if not setting:
            setting = Setting(id="system_config", data=dict(DEFAULT_SETTINGS))
            db.add(setting)
            await db.flush()
        else:
            data = dict(setting.data or {})
            changed = False
            for key, value in DEFAULT_SETTINGS.items():
                if key not in data:
                    data[key] = value
                    changed = True
            if changed:
                setting.data = data

        # Compatibilidad con instalaciones anteriores: si ya existe un administrador,
        # no mostramos el asistente de primera configuración.
        admin_exists = (await db.execute(select(User).where(User.role == "admin").limit(1))).scalar_one_or_none()
        if admin_exists and not setting.data.get("initial_setup_completed"):
            data = dict(setting.data or {})
            data["initial_setup_completed"] = True
            setting.data = data
            logger.info("Instalación existente detectada; se conserva el acceso actual")

        await db.commit()
