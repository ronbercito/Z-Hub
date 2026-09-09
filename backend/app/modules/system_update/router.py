"""Archivo: backend/app/modules/system_update/router.py
Actualización: 2026-09-09 — versión 1.1.12: consulta dos repositorios y prioriza Z-Hub.
Función: consulta Z-Hub y MikroHub legado, compara versiones, selecciona la actualización
         más reciente y ejecuta run_update.sh indicando el repositorio elegido.
Recibe: solicitudes administrativas desde UpdateCenter.jsx y datos Git locales.
Entrega: estado, fuente seleccionada, fuentes consultadas, fase, porcentaje y detalle de fallo.
"""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.security import require_role

router = APIRouter(prefix="/system-update", tags=["Actualizaciones"])
ROOT = Path(os.environ.get("MIKROHUB_ROOT", "/var/www/mikrohub"))
UPDATE_SCRIPT = ROOT / "backend/app/modules/system_update/run_update.sh"
LOG_FILE = Path("/tmp/mikrohub-update.log")
ERROR_LOG_FILE = Path("/tmp/mikrohub-update-error.log")
PID_FILE = Path("/tmp/mikrohub-update.pid")
VERSION_FILE = "frontend/src/modules/system-update/version.js"

PRIMARY_REPOSITORY = os.environ.get("ZHUB_REPOSITORY", "https://github.com/ronbercito/Z-Hub.git")
LEGACY_REPOSITORY = os.environ.get(
    "MIKROHUB_LEGACY_REPOSITORY",
    os.environ.get("MIKROHUB_REPOSITORY", "https://github.com/ronbercito/mirkohub.git"),
)
REPOSITORIES = (
    {"id": "zhub", "name": "Z-Hub", "url": PRIMARY_REPOSITORY, "priority": 2},
    {"id": "mirkohub", "name": "MikroHub legado", "url": LEGACY_REPOSITORY, "priority": 1},
)


def _git(*args: str) -> str:
    result = subprocess.run(["git", "-C", str(ROOT), *args], text=True, capture_output=True, timeout=45)
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout or "Error ejecutando git").strip())
    return result.stdout.strip()


def _source_for(ref: str) -> str:
    return _git("show", f"{ref}:{VERSION_FILE}")


def _version_and_changelog(source: str) -> tuple[str, list[dict[str, str]]]:
    version = re.search(r'PANEL_VERSION\s*=\s*["\']([^"\']+)["\']', source)
    entries = re.findall(r'\{\s*type:\s*["\']([^"\']+)["\']\s*,\s*text:\s*["\']([^"\']+)["\']\s*\}', source)
    return (version.group(1) if version else "0.0.0"), [{"type": a, "text": b} for a, b in entries]


def _version_key(version: str) -> tuple[int, ...]:
    parts = [int(piece) for piece in re.findall(r"\d+", version)]
    return tuple((parts + [0, 0, 0, 0])[:4])


def _fetch_candidate(repository: dict[str, object]) -> dict[str, object]:
    repo_id = str(repository["id"])
    ref = f"refs/remotes/system-update/{repo_id}/main"
    _git("fetch", "--force", str(repository["url"]), f"+refs/heads/main:{ref}")
    commit = _git("rev-parse", ref)
    version, changelog = _version_and_changelog(_source_for(ref))
    return {
        "id": repo_id,
        "name": str(repository["name"]),
        "url": str(repository["url"]),
        "priority": int(repository["priority"]),
        "ref": ref,
        "commit": commit,
        "version": version,
        "changelog": changelog,
        "ok": True,
    }


def _available_sources() -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    candidates: list[dict[str, object]] = []
    sources: list[dict[str, object]] = []
    for repository in REPOSITORIES:
        try:
            candidate = _fetch_candidate(repository)
            candidates.append(candidate)
            sources.append({
                "id": candidate["id"],
                "name": candidate["name"],
                "ok": True,
                "version": candidate["version"],
                "commit": str(candidate["commit"])[:12],
            })
        except RuntimeError as exc:
            sources.append({
                "id": str(repository["id"]),
                "name": str(repository["name"]),
                "ok": False,
                "error": str(exc)[-500:],
            })
    return candidates, sources


def _select_candidate(candidates: list[dict[str, object]]) -> dict[str, object]:
    if not candidates:
        raise RuntimeError("Ninguno de los repositorios de actualización respondió correctamente")
    return max(candidates, key=lambda item: (_version_key(str(item["version"])), int(item["priority"])))


def _log_state() -> tuple[str, str, str, bool]:
    log = LOG_FILE.read_text(errors="replace") if LOG_FILE.exists() else ""
    error_log = ERROR_LOG_FILE.read_text(errors="replace") if ERROR_LOG_FILE.exists() else ""
    if "SUCCESS:" in log:
        return "success", log, error_log, False
    if "ROLLBACK_FAILED:" in log:
        return "rollback_failed", log, error_log, False
    if "ROLLED_BACK:" in log or "FAILED:" in log:
        return "rolled_back", log, error_log, False
    running = False
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            os.kill(pid, 0)
            running = True
        except (ValueError, OSError):
            PID_FILE.unlink(missing_ok=True)
    return ("running" if running else "idle"), log, error_log, running


def _progress_from_log(log: str, state: str) -> tuple[int, str]:
    if state == "success":
        return 100, "Actualización completada exitosamente"
    matches = re.findall(r"PROGRESS:(\d{1,3}):(.*)", log)
    if matches:
        percent, phase = matches[-1]
        return min(100, max(0, int(percent))), phase.strip()
    if state == "rolled_back":
        return 100, "Actualización fallida - versión anterior restaurada"
    if state == "rollback_failed":
        return 100, "Error crítico - requiere revisión manual"
    return 0, "Esperando actualización"


def _extract_error_message(error_log: str) -> str:
    """Extrae contexto útil del fallo, incluyendo errores reales de React/Webpack."""
    if not error_log.strip():
        return "Error desconocido. Revisa los logs del servidor."
    lines = [line.strip() for line in error_log.strip().splitlines() if line.strip()]
    patterns = ("Failed to compile", "Module not found", "SyntaxError", "TypeError:", "ReferenceError:", "ERROR in ", "ERROR_SETUP:", "error ")
    selected = []
    for index, line in enumerate(lines):
        if any(pattern in line for pattern in patterns):
            selected.extend(lines[max(0, index - 1): min(len(lines), index + 5)])
    if selected:
        unique = list(dict.fromkeys(selected))
        return "\n".join(unique[-14:])[-3500:]
    return "\n".join(lines[-14:])[-3500:]


@router.get("/status", dependencies=[Depends(require_role("admin"))])
async def update_status(response: Response):
    response.headers["Cache-Control"] = "no-store, max-age=0"
    response.headers["Pragma"] = "no-cache"
    try:
        current_commit = _git("rev-parse", "HEAD")
        current_version, current_changelog = _version_and_changelog(_source_for("HEAD"))
        candidates, sources = _available_sources()
        selected = _select_candidate(candidates)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar los repositorios de actualización: {exc}") from exc

    state, log, error_log, running = _log_state()
    progress, phase = _progress_from_log(log, state)
    error_message = _extract_error_message(error_log) if state in {"rolled_back", "rollback_failed"} else ""
    return {
        "available": current_commit != selected["commit"],
        "current": {"version": current_version, "commit": current_commit[:12], "changelog": current_changelog},
        "remote": {
            "version": selected["version"],
            "commit": str(selected["commit"])[:12],
            "changelog": selected["changelog"],
            "source": selected["id"],
            "source_name": selected["name"],
        },
        "sources": sources,
        "installation": {"state": state, "running": running, "progress": progress, "phase": phase, "error": error_message},
    }


@router.post("/install", dependencies=[Depends(require_role("admin"))], status_code=status.HTTP_202_ACCEPTED)
async def install_update():
    _, _, _, running = _log_state()
    if running:
        raise HTTPException(status_code=409, detail="Ya hay una actualización en curso")
    if not UPDATE_SCRIPT.is_file():
        raise HTTPException(status_code=500, detail="No se encontró el script de actualización")
    try:
        current_commit = _git("rev-parse", "HEAD")
        candidates, _ = _available_sources()
        selected = _select_candidate(candidates)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar GitHub: {exc}") from exc
    if current_commit == selected["commit"]:
        raise HTTPException(status_code=409, detail="El panel ya está en la versión más reciente")

    LOG_FILE.write_text("")
    ERROR_LOG_FILE.write_text("")
    env = os.environ.copy()
    env["MIKROHUB_UPDATE_REPOSITORY"] = str(selected["url"])
    env["MIKROHUB_UPDATE_SOURCE"] = str(selected["id"])
    process = subprocess.Popen(
        ["bash", str(UPDATE_SCRIPT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
        env=env,
    )
    PID_FILE.write_text(str(process.pid))
    return {
        "message": f"Actualización iniciada desde {selected['name']}",
        "source": selected["id"],
        "installation": {"state": "running", "pid": process.pid},
    }
