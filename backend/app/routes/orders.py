from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from ..database import get_db
from ..models import Order, OrderItem, Product, Setting, Admin
from ..schemas import (
    OrderCreate, OrderResponse, OrderListResponse, OrderStatusUpdate
)
from ..auth import get_current_admin

router = APIRouter(prefix="/api", tags=["Orders"])


def generate_order_number(db: Session) -> str:
    prefix_setting = db.query(Setting).filter(Setting.key == "order_prefix").first()
    prefix = prefix_setting.value if prefix_setting else "ORD-"

    last_order = db.query(Order).order_by(desc(Order.id)).first()
    next_id = (last_order.id + 1) if last_order else 1
    return f"{prefix}{next_id:06d}"


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.hotel_name or not payload.hotel_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hotel name is required."
        )

    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one product item is required to create an order."
        )

    order_num = generate_order_number(db)
    grand_total = 0.0

    order = Order(
        order_number=order_num,
        hotel_name=payload.hotel_name.strip(),
        total_amount=0.0,
        status="New",
        notes=payload.notes,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.flush()

    for item in payload.items:
        if item.quantity <= 0:
            continue

        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with ID {item.product_id} not found."
            )

        line_total = round(prod.price * item.quantity, 2)
        grand_total += line_total

        order_item = OrderItem(
            order_id=order.id,
            product_id=prod.id,
            product_name_snapshot=prod.name,
            unit_type_snapshot=prod.unit_type,
            quantity=item.quantity,
            price_snapshot=prod.price,
            total=line_total
        )
        db.add(order_item)

    order.total_amount = round(grand_total, 2)
    db.commit()
    db.refresh(order)
    return order


@router.get("/admin/orders", response_model=List[OrderListResponse])
def get_admin_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    q: Optional[str] = Query(None, description="Search by Hotel Name or Order Number"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Order)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Order.status == status_filter)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Order.hotel_name.ilike(search_term),
                Order.order_number.ilike(search_term)
            )
        )

    orders = query.order_by(Order.id.desc()).all()
    results = []
    for ord in orders:
        item_count = sum(it.quantity for it in ord.items)
        results.append({
            "id": ord.id,
            "order_number": ord.order_number,
            "hotel_name": ord.hotel_name,
            "total_amount": ord.total_amount,
            "status": ord.status,
            "created_at": ord.created_at,
            "item_count": item_count
        })
    return results


@router.get("/admin/orders/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


@router.patch("/admin/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order.status = payload.status
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


@router.delete("/admin/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order_num = order.order_number
    db.delete(order)
    db.commit()
    return {"message": f"Order {order_num} was deleted successfully.", "deleted": True}


@router.delete("/admin/orders")
def clear_all_orders(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    count = db.query(Order).count()
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.commit()
    return {"message": f"All {count} orders have been cleared successfully.", "deleted_count": count}

