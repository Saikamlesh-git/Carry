from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Category, Product, Admin
from ..schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api", tags=["Categories"])


@router.get("/categories", response_model=List[CategoryResponse])
def get_public_categories(db: Session = Depends(get_db)):
    """Fetch all active categories for the public user store."""
    categories = (
        db.query(Category)
        .filter(Category.is_active == True)
        .order_by(Category.display_order.asc(), Category.id.asc())
        .all()
    )
    result = []
    for cat in categories:
        count = (
            db.query(func.count(Product.id))
            .filter(Product.category_id == cat.id, Product.is_active == True)
            .scalar()
        )
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "image_url": cat.image_url,
            "display_order": cat.display_order,
            "is_active": cat.is_active,
            "created_at": cat.created_at,
            "product_count": count or 0,
        }
        result.append(cat_dict)
    return result


@router.get("/admin/categories", response_model=List[CategoryResponse])
def get_admin_categories(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Fetch all categories for admin management."""
    categories = (
        db.query(Category)
        .order_by(Category.display_order.asc(), Category.id.asc())
        .all()
    )
    result = []
    for cat in categories:
        count = (
            db.query(func.count(Product.id))
            .filter(Product.category_id == cat.id)
            .scalar()
        )
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "image_url": cat.image_url,
            "display_order": cat.display_order,
            "is_active": cat.is_active,
            "created_at": cat.created_at,
            "product_count": count or 0,
        }
        result.append(cat_dict)
    return result


@router.post("/admin/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    existing = db.query(Category).filter(Category.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{payload.name}' already exists."
        )

    cat = Category(
        name=payload.name.strip(),
        description=payload.description,
        image_url=payload.image_url,
        display_order=payload.display_order,
        is_active=payload.is_active
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {
        "id": cat.id,
        "name": cat.name,
        "description": cat.description,
        "image_url": cat.image_url,
        "display_order": cat.display_order,
        "is_active": cat.is_active,
        "created_at": cat.created_at,
        "product_count": 0,
    }


@router.put("/admin/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if payload.name is not None:
        name_clean = payload.name.strip()
        duplicate = (
            db.query(Category)
            .filter(Category.name.ilike(name_clean), Category.id != category_id)
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{name_clean}' already exists."
            )
        cat.name = name_clean

    if payload.description is not None:
        cat.description = payload.description
    if payload.image_url is not None:
        cat.image_url = payload.image_url
    if payload.display_order is not None:
        cat.display_order = payload.display_order
    if payload.is_active is not None:
        cat.is_active = payload.is_active

    db.commit()
    db.refresh(cat)

    count = (
        db.query(func.count(Product.id))
        .filter(Product.category_id == cat.id)
        .scalar()
    )
    return {
        "id": cat.id,
        "name": cat.name,
        "description": cat.description,
        "image_url": cat.image_url,
        "display_order": cat.display_order,
        "is_active": cat.is_active,
        "created_at": cat.created_at,
        "product_count": count or 0,
    }


@router.delete("/admin/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    product_count = db.query(func.count(Product.id)).filter(Product.category_id == cat.id).scalar()
    if product_count > 0:
        # Instead of deleting products, we deactivate the category to preserve data integrity
        cat.is_active = False
        db.commit()
        return {
            "message": f"Category '{cat.name}' has {product_count} attached product(s) and was deactivated.",
            "deactivated": True
        }

    db.delete(cat)
    db.commit()
    return {"message": f"Category '{cat.name}' deleted successfully.", "deleted": True}
