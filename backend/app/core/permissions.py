"""Catálogo central y verificación de permisos del panel."""
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, is_admin_role

PERMISSION_CATALOG = {
    "dashboard": ["view"], "clients": ["view", "create", "edit", "delete", "suspend"],
    "plans": ["view", "create", "edit", "delete", "operate"],
    "billing": ["view", "create", "edit", "delete", "pay", "report"],
    "network": ["view", "create", "edit", "delete", "operate"],
    # Solo controla la visibilidad del submenú Routers; no limita IPv4, NAP ni clientes.
    "router_menu": ["view"],
    "olt": ["view", "create", "edit", "delete", "operate"],
    "monitoring": ["view", "create", "edit", "delete", "operate"],
    "tickets": ["view", "create", "edit", "delete"], "inventory": ["view", "create", "edit", "delete"],
    "messaging": ["view", "send"], "hotspot": ["view", "create", "edit", "delete", "operate"],
    "tasks": ["view", "create", "edit", "delete"], "settings": ["view", "edit"], "staff": ["view", "manage"],
}
ROLE_DEFAULTS = {
    "admin": {module: list(actions) for module, actions in PERMISSION_CATALOG.items()},
    "tecnico": {"dashboard":["view"], "clients":["view","create","edit"], "plans":["view"], "monitoring":["view"], "tickets":["view","create","edit"], "tasks":["view","create","edit"]},
    "cobrador": {"dashboard":["view"], "clients":["view"], "billing":["view","create","edit","pay","report"], "messaging":["view","send"], "tickets":["view","create"]},
}

def normalized_permissions(user: dict) -> dict:
    saved = user.get("permissions") or {}
    return saved if saved else ROLE_DEFAULTS.get(user.get("role"), {})

def allowed(user: dict, module: str, action: str = "view") -> bool:
    return is_admin_role(user.get("role")) or action in normalized_permissions(user).get(module, [])

def ensure_allowed(user: dict, module: str, action: str) -> None:
    if not allowed(user, module, action):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Sin permiso de {action} en {module}")

def action_for_request(request: Request, module: str) -> str:
    method, path = request.method.upper(), request.url.path.lower()
    if method in {"GET", "HEAD", "OPTIONS"}: return "view"
    if method == "DELETE": return "delete"
    if method in {"PUT", "PATCH"}: return "edit"
    if module == "billing":
        if "/payments" in path: return "pay"
        if "mass-generate" in path or "mark-overdue" in path: return "report"
    if module in {"network", "olt", "monitoring", "plans", "hotspot"} and any(token in path for token in ("ping","test-connection","sync","olt/","command","toggle","address-list","cut","authorize","reboot","activate","deactivate")):
        return "operate"
    return "send" if module == "messaging" else "create"

def require_permission(module: str):
    async def checker(request: Request, user: dict = Depends(get_current_user)) -> dict:
        ensure_allowed(user, module, action_for_request(request, module))
        return user
    return checker

async def require_router_access(request: Request, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict:
    """Decide el permiso por tipo de equipo para el router compartido /api/routers."""
    path = request.url.path.rstrip("/")
    if path.endswith("/olt-profiles"):
        ensure_allowed(user, "olt", "view")
        return user
    if path.endswith("/sync-cuts"):
        ensure_allowed(user, "network", "operate")
        return user
    router_id = request.path_params.get("router_id")
    if not router_id:
        action = action_for_request(request, "network")
        if request.method.upper() == "GET":
            if not (allowed(user, "network", "view") or allowed(user, "olt", "view")):
                raise HTTPException(status_code=403, detail="Sin permiso para ver equipos de red")
        elif not (allowed(user, "network", action) or allowed(user, "olt", action)):
            raise HTTPException(status_code=403, detail=f"Sin permiso para {action} equipos de red")
        return user
    from app.models.router import Router
    equipment = await db.get(Router, router_id)
    if not equipment:
        return user
    module = "olt" if equipment.device_type == "olt" else "network"
    ensure_allowed(user, module, action_for_request(request, module))
    return user
