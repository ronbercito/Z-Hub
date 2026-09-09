"""
Archivo: backend/app/core/seed.py
Función: Datos iniciales mínimos al arrancar: crea la fila de configuración por defecto.
         La cuenta administradora se crea únicamente desde el asistente de configuración inicial.
"""
import logging

from app.core.database import SessionLocal
from app.models.setting import DEFAULT_SETTINGS, Setting

logger = logging.getLogger("zhub.seed")


async def seed_initial_data():
    async with SessionLocal() as db:
        setting = await db.get(Setting, "system_config")
        if not setting:
            db.add(Setting(id="system_config", data=dict(DEFAULT_SETTINGS)))
        else:
            changed = False
            for key, value in DEFAULT_SETTINGS.items():
                if key not in (setting.data or {}):
                    setting.data[key] = value
                    changed = True
            if changed:
                db.add(setting)
        await db.commit()
        logger.info("Configuración inicial disponible")
