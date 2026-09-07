"""Catálogo central y verificación de permisos del panel."""
from fastapi import Depends, HTTPException, Request, status
from app.core.security import get_current_user

PERMISSION_CATALOG = {
    "dashboard": ["view"],
    "clients": ["view", "create", "edit", "delete", "suspend"],
    "plans": ["view", "create", "edit", "delete", "operate"],
    "billing": ["view", "create", "edit", "delete", "pay", "report"],
    "network": ["view", "create", "edit", "delete", "operate"],
    "olt": ["view", "operate"],
    "monitoring": ["view", "create", "edit", "delete", "operate"],
    "tickets": ["view", "create", "edit", "delete"],
    "inventory": ["view", "create", "edit", "delete"],
    "messaging": ["view", "send"],
    "hotspot": ["view", "create", "edit", "delete", "operate"],
    "tasks": ["view", "create", "edit", "delete"],
    "settings": ["view", "edit"],
    "staff": ["view", "manage"],
}

ROLE_DEFAULTS = {
    "admin": {module: list(actions) for module, actions in PERMISSION_CATALOG.items()},
    "tecnico": {
        "dashboard": ["view"], "clients": ["view", "create", "edit"],
        "plans": ["view"], "monitoring": ["view"],
        "tickets": ["view", "create", "edit"], "tasks": ["view", "create", "edit"],
    },
    "cobrador": {
        "dashboard": ["view"], "clients": ["view"], "billing": ["view", "create", "edit", "pay", "report"],
        "messaging": ["view", "send"], "tickets": ["view", "create"],
    },
}

def normalized_permissions(user: dict) -> dict:
    saved = user.get("permissions") or {}
    return saved if saved else ROLE_DEFAULTS.get(user.get("role"), {})

def allowed(user: dict, module: str, action: str = "view") -> bool:
    if user.get("role") == "admin":
        return True
    return action in normalized_permissions(user).get(module, [])

def action_for_request(request: Request, module: str) -> str:
    method, path = request.method.upper(), request.url.path.lower()
    if method in {"GET", "HEAD", "OPTIONS"}:
        return "view"
    if method == "DELETE":
        return "delete"
    if method in {"PUT", "PATCH"}:
        return "edit"
    if module == "billing":
        if "/payments" in path:
            return "pay"
        if "mass-generate" in path or "mark-overdue" in path:
            return "report"
    if module in {"network", "olt", "monitoring", "plans", "hotspot"}:
        operational = ("ping", "test-connection", "sync", "olt/", "command", "toggle", "address-list", "cut", "authorize", "reboot", "activate", "deactivate")
        if any(token in path for token in operational):
            return "operate"
    if module == "messaging":
        return "send"
    return "create"

def require_permission(module: str):
    async def checker(request: Request, user: dict = Depends(get_current_user)) -> dict:
        action = action_for_request(request, module)
        if not allowed(user, module, action):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Sin permiso de {action} en {module}")
        return user
    return checker
