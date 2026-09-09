from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Product, Category, Order, Admin
from ..schemas import DashboardStats, OrderListResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Stats"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    new_orders = db.query(func.count(Order.id)).filter(Order.status == "New").scalar() or 0
    total_order_value = db.query(func.sum(Order.total_amount)).scalar() or 0.0

    recent_orders_db = db.query(Order).order_by(Order.id.desc()).limit(5).all()
    recent_orders = []
    for ord in recent_orders_db:
        item_count = sum(it.quantity for it in ord.items)
        recent_orders.append(
            OrderListResponse(
                id=ord.id,
                order_number=ord.order_number,
                hotel_name=ord.hotel_name,
                total_amount=ord.total_amount,
                status=ord.status,
                created_at=ord.created_at,
                item_count=item_count
            )
        )

    return DashboardStats(
        total_products=total_products,
        total_categories=total_categories,
        total_orders=total_orders,
        new_orders=new_orders,
        total_order_value=round(total_order_value, 2),
        recent_orders=recent_orders
    )
