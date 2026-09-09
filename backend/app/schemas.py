from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ---------------- Category Schemas ----------------
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    product_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# ---------------- Product Schemas ----------------
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: int
    price: float = Field(..., ge=0)
    unit_type: str = Field(..., min_length=1, max_length=50)
    sku: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = Field(None, ge=0)
    unit_type: Optional[str] = None
    sku: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Order Schemas ----------------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name_snapshot: str
    unit_type_snapshot: str
    quantity: int
    price_snapshot: float
    total: float

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    hotel_name: str = Field(..., min_length=1, max_length=200)
    items: List[OrderItemCreate] = Field(..., min_length=1)
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(New|Processing|Completed|Cancelled)$")


class OrderResponse(BaseModel):
    id: int
    order_number: str
    hotel_name: str
    total_amount: float
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    id: int
    order_number: str
    hotel_name: str
    total_amount: float
    status: str
    created_at: datetime
    item_count: int

    model_config = ConfigDict(from_attributes=True)


# ---------------- Setting Schemas ----------------
class SettingsMap(BaseModel):
    whatsapp_number: str
    business_name: str
    currency: str
    order_prefix: str


class SettingsUpdate(BaseModel):
    whatsapp_number: Optional[str] = None
    business_name: Optional[str] = None
    currency: Optional[str] = None
    order_prefix: Optional[str] = None


# ---------------- Auth Schemas ----------------
class AdminLoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class AdminResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Dashboard Stats ----------------
class DashboardStats(BaseModel):
    total_products: int
    total_categories: int
    total_orders: int
    new_orders: int
    total_order_value: float
    recent_orders: List[OrderListResponse]
