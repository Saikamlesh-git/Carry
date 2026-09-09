from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Setting, Admin
from ..schemas import SettingsMap, SettingsUpdate
from ..auth import get_current_admin

router = APIRouter(prefix="/api", tags=["Settings"])


def get_all_settings_dict(db: Session) -> dict:
    defaults = {
        "whatsapp_number": "+919876543210",
        "business_name": "Carry Hotel Supplies",
        "currency": "₹",
        "order_prefix": "ORD-"
    }
    settings = db.query(Setting).all()
    for s in settings:
        defaults[s.key] = s.value
    return defaults


@router.get("/settings/public")
def get_public_settings(db: Session = Depends(get_db)):
    all_s = get_all_settings_dict(db)
    return {
        "whatsapp_number": all_s["whatsapp_number"],
        "business_name": all_s["business_name"],
        "currency": all_s["currency"],
        "order_prefix": all_s["order_prefix"],
    }


@router.get("/admin/settings", response_model=SettingsMap)
def get_admin_settings(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    all_s = get_all_settings_dict(db)
    return SettingsMap(**all_s)


@router.put("/admin/settings", response_model=SettingsMap)
def update_admin_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        if value is not None:
            s = db.query(Setting).filter(Setting.key == key).first()
            if s:
                s.value = str(value).strip()
            else:
                db.add(Setting(key=key, value=str(value).strip()))

    db.commit()
    all_s = get_all_settings_dict(db)
    return SettingsMap(**all_s)
