from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Product, Category, OrderItem, Admin
from ..schemas import ProductCreate, ProductUpdate, ProductResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api", tags=["Products"])


def serialize_product(p: Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "image_url": p.image_url,
        "category_id": p.category_id,
        "price": p.price,
        "unit_type": p.unit_type,
        "sku": p.sku,
        "is_active": p.is_active,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "category_name": p.category.name if p.category else None,
    }


@router.get("/products", response_model=List[ProductResponse])
def get_public_products(
    category_id: Optional[int] = Query(None, description="Filter by Category ID"),
    q: Optional[str] = Query(None, description="Search query across name, sku, and category"),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Product)
        .join(Category, Product.category_id == Category.id)
        .filter(Product.is_active == True, Category.is_active == True)
    )

    if category_id is not None and category_id > 0:
        query = query.filter(Product.category_id == category_id)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.description.ilike(search_term),
                Category.name.ilike(search_term),
            )
        )

    products = query.order_by(Category.display_order.asc(), Product.name.asc()).all()
    return [serialize_product(p) for p in products]


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return serialize_product(prod)


@router.get("/admin/products", response_model=List[ProductResponse])
def get_admin_products(
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Product).outerjoin(Category, Product.category_id == Category.id)

    if category_id is not None and category_id > 0:
        query = query.filter(Product.category_id == category_id)

    if is_active is not None:
        query = query.filter(Product.is_active == is_active)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Category.name.ilike(search_term),
            )
        )

    products = query.order_by(Product.id.desc()).all()
    return [serialize_product(p) for p in products]


@router.post("/admin/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    # Verify category exists
    cat = db.query(Category).filter(Category.id == payload.category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected category does not exist.")

    prod = Product(
        name=payload.name.strip(),
        description=payload.description,
        image_url=payload.image_url,
        category_id=payload.category_id,
        price=payload.price,
        unit_type=payload.unit_type.strip(),
        sku=payload.sku.strip() if payload.sku else None,
        is_active=payload.is_active,
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return serialize_product(prod)


@router.put("/admin/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected category does not exist.")
        prod.category_id = payload.category_id

    if payload.name is not None:
        prod.name = payload.name.strip()
    if payload.description is not None:
        prod.description = payload.description
    if payload.image_url is not None:
        prod.image_url = payload.image_url
    if payload.price is not None:
        prod.price = payload.price
    if payload.unit_type is not None:
        prod.unit_type = payload.unit_type.strip()
    if payload.sku is not None:
        prod.sku = payload.sku.strip() if payload.sku else None
    if payload.is_active is not None:
        prod.is_active = payload.is_active

    db.commit()
    db.refresh(prod)
    return serialize_product(prod)


@router.delete("/admin/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    # Check if this product has historical orders
    has_orders = db.query(OrderItem).filter(OrderItem.product_id == product_id).first() is not None

    if has_orders:
        # Soft delete / deactivation ensures historical order snapshots remain completely intact
        prod.is_active = False
        db.commit()
        return {
            "message": f"Product '{prod.name}' is referenced in past orders. It has been deactivated to preserve order history.",
            "soft_deleted": True
        }

    db.delete(prod)
    db.commit()
    return {"message": f"Product '{prod.name}' was permanently deleted.", "deleted": True}
