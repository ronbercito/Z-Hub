"""
Módulo aislado de actualizaciones del panel MikroHub.

Consulta la rama remota main, compara el commit instalado con el remoto y ejecuta
run_update.sh en segundo plano. El script conserva rollback automático si falla.
"""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import require_role

router = APIRouter(prefix="/system-update", tags=["Actualizaciones"])
ROOT = Path(os.environ.get("MIKROHUB_ROOT", "/var/www/mikrohub"))
UPDATE_SCRIPT = ROOT / "backend/app/modules/system_update/run_update.sh"
LOG_FILE = Path("/tmp/mikrohub-update.log")
PID_FILE = Path("/tmp/mikrohub-update.pid")
VERSION_FILE = "frontend/src/modules/system-update/version.js"


def _git(*args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(ROOT), *args],
        text=True,
        capture_output=True,
        timeout=30,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "Error ejecutando git").strip()
        raise RuntimeError(detail)
    return result.stdout.strip()


def _source_for(ref: str) -> str:
    return _git("show", f"{ref}:{VERSION_FILE}")


def _version_and_changelog(source: str) -> tuple[str, list[dict[str, str]]]:
    version = re.search(r'PANEL_VERSION\s*=\s*["\']([^"\']+)["\']', source)
    entries = re.findall(
        r'\{\s*type:\s*["\']([^"\']+)["\']\s*,\s*text:\s*["\']([^"\']+)["\']\s*\}',
        source,
    )
    return (version.group(1) if version else "sin versión"), [
        {"type": item_type, "text": item_text} for item_type, item_text in entries
    ]


def _log_state() -> tuple[str, str, bool]:
    log = LOG_FILE.read_text(errors="replace") if LOG_FILE.exists() else ""
    if "SUCCESS:" in log:
        return "success", log, False
    if "ROLLBACK_FAILED:" in log:
        return "rollback_failed", log, False
    if "ROLLED_BACK:" in log or "FAILED:" in log:
        return "rolled_back", log, False

    running = False
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            os.kill(pid, 0)
            running = True
        except (ValueError, OSError):
            PID_FILE.unlink(missing_ok=True)
    return ("running" if running else "idle"), log, running


def _progress_from_log(log: str, state: str) -> tuple[int, str]:
    if state == "success":
        return 100, "Actualización terminada"
    matches = re.findall(r"PROGRESS:(\d{1,3}):(.*)", log)
    if matches:
        percent, phase = matches[-1]
        return min(100, max(0, int(percent))), phase.strip()
    if state in {"rolled_back", "rollback_failed"}:
        return 100, "No se pudo instalar la actualización"
    return 0, "Esperando actualización"


@router.get("/status", dependencies=[Depends(require_role("admin"))])
async def update_status():
    current_commit = _git("rev-parse", "HEAD")
    _git("fetch", "origin", "main")
    remote_commit = _git("rev-parse", "origin/main")
    current_version, current_changelog = _version_and_changelog(_source_for("HEAD"))
    remote_version, remote_changelog = _version_and_changelog(_source_for("origin/main"))
    state, log, running = _log_state()
    progress, phase = _progress_from_log(log, state)
    return {
        "available": current_commit != remote_commit,
        "current": {"version": current_version, "commit": current_commit[:12], "changelog": current_changelog},
        "remote": {"version": remote_version, "commit": remote_commit[:12], "changelog": remote_changelog},
        "installation": {"state": state, "running": running, "progress": progress, "phase": phase},
    }


@router.post("/install", dependencies=[Depends(require_role("admin"))], status_code=status.HTTP_202_ACCEPTED)
async def install_update():
    state, _, running = _log_state()
    if running:
        raise HTTPException(status_code=409, detail="Ya hay una actualización en curso")
    if not UPDATE_SCRIPT.is_file():
        raise HTTPException(status_code=500, detail="No se encontró el script de actualización")

    try:
        current_commit = _git("rev-parse", "HEAD")
        _git("fetch", "origin", "main")
        remote_commit = _git("rev-parse", "origin/main")
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar GitHub: {exc}") from exc

    if current_commit == remote_commit:
        raise HTTPException(status_code=409, detail="El panel ya está en la versión más reciente")

    LOG_FILE.write_text("")
    process = subprocess.Popen(
        ["bash", str(UPDATE_SCRIPT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    PID_FILE.write_text(str(process.pid))
    return {"message": "Actualización iniciada", "installation": {"state": "running", "pid": process.pid}}
