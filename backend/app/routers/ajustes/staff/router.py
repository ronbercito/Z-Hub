"""Gestión personal aislada: operadores, perfiles y permisos ampliables."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, hash_password, require_role
from app.models.user import User

router = APIRouter(prefix="/staff", tags=["Ajustes / Gestión personal"], dependencies=[Depends(require_role("admin"))])
PERMISSION_CATALOG = {
 "dashboard": ["view"], "clients": ["view","create","edit","suspend"],
 "billing": ["view","create","edit","pay","report"], "network": ["view","operate"],
 "olt": ["view","operate"], "monitoring": ["view","operate"], "tickets": ["view","create","edit"],
 "inventory": ["view","edit"], "messaging": ["view","send"], "settings": ["view","edit"], "staff": ["view","manage"]}
ROLE_DEFAULTS = {"admin": {m: a for m,a in PERMISSION_CATALOG.items()},
 "tecnico": {"dashboard":["view"],"clients":["view","create","edit","suspend"],"network":["view","operate"],"olt":["view","operate"],"monitoring":["view","operate"],"tickets":["view","create","edit"]},
 "cobrador": {"dashboard":["view"],"clients":["view"],"billing":["view","create","pay","report"],"messaging":["view","send"]}}
class StaffIn(BaseModel):
 name: str; email: str; phone: str=""; role: str="tecnico"; password: str=""; is_active: bool=True; permissions: dict=Field(default_factory=dict); access_schedule: dict=Field(default_factory=dict)
def public(u): return u.to_dict(exclude=("password_hash",))
@router.get("/catalog")
async def catalog(): return {"modules": PERMISSION_CATALOG,"defaults":ROLE_DEFAULTS}
@router.get("")
async def list_staff(db: AsyncSession=Depends(get_db)): return [public(u) for u in (await db.execute(select(User).order_by(User.created_at))).scalars()]
@router.post("")
async def create(data: StaffIn, db: AsyncSession=Depends(get_db)):
 if data.role not in ROLE_DEFAULTS: raise HTTPException(422,"Rol no válido")
 email=data.email.strip().lower()
 if (await db.execute(select(User).where(User.email==email))).scalar_one_or_none(): raise HTTPException(400,"El correo ya existe")
 if len(data.password)<8: raise HTTPException(422,"La contraseña debe tener al menos 8 caracteres")
 u=User(name=data.name.strip(),email=email,phone=data.phone.strip(),role=data.role,password_hash=hash_password(data.password),is_active=data.is_active,permissions=data.permissions or ROLE_DEFAULTS[data.role],access_schedule=data.access_schedule)
 db.add(u); await db.commit(); return public(u)
@router.put("/{user_id}")
async def update(user_id:str,data:StaffIn,current=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
 u=await db.get(User,user_id)
 if not u: raise HTTPException(404,"Operador no encontrado")
 if u.id==current["id"] and not data.is_active: raise HTTPException(400,"No puede desactivar su propia cuenta")
 u.name=data.name.strip();u.phone=data.phone.strip();u.role=data.role;u.is_active=data.is_active;u.permissions=data.permissions or ROLE_DEFAULTS[data.role];u.access_schedule=data.access_schedule
 if data.password: u.password_hash=hash_password(data.password)
 await db.commit(); return public(u)
