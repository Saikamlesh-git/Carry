# Carry – B2B Hotel Packaging & Essentials Platform

**Carry** is a modern, high-performance, mobile-first B2B ordering web application designed specifically for **hotels, restaurants, catering businesses, and food-service establishments** to order essential packaging products (carry bags, sheets, foil, rolls, meal containers, cups, and miscellaneous supplies) in **₹ Indian Rupees**.

---

## 🌟 Core Architecture & Experience Separation

The system features two completely segregated experiences:

### 1. Public Customer Storefront (`/`)
* **Immediate Ordering Access**: Zero login or password required.
* **Hotel Identification**: Prompts for the hotel/restaurant name on first visit (persisted in session) and dynamically displays *"Ordering for: [Hotel Name]"*.
* **Live Product Search**: Instant keyword filtering across product name, SKU, and category.
* **Dynamic Category Tabs**: Touch-friendly horizontal scroll on mobile, sleek tabs on desktop (All, Carry Bags, Sheets, Foil, Rolls, Containers, Cups, Others + Admin additions).
* **Precise Quantity Controls (`− 0 +`)**:
  * Steppers default to `0`.
  * Touching `+` immediately adds the item to the cart (`0 → 1 → 2...`).
  * Touching `−` decrements; reaching `0` removes it from the cart with instant toast notification feedback.
* **Instant Cart & Drawer**: Slide-in cart on desktop, responsive bottom sheet on mobile with exact breakdown (e.g. `₹250 × 5 = ₹1,250`).
* **Order Confirmation & WhatsApp Ordering**:
  * Confirmation modal reviews items and total before dispatch.
  * Generates an itemized order message with **HOTEL NAME at the very top**.
  * Directly launches WhatsApp using the number configured in Admin Settings.
  * Automatically stores the immutable order and price snapshots in the database.
* **Strict Admin Isolation**: The public store contains **zero** admin links, buttons, or indicators.

### 2. Isolated Admin Console (`/admin`)
* **Restricted Route**: Accessible exclusively by typing `/admin` into the browser address bar.
* **Secure Authentication**: Bcrypt password hashing and JWT token authentication.
* **Key Performance Dashboard**: Real-time KPI summary cards (Total Products, Total Categories, Total Orders, New Orders, Total Order Value in ₹) + Recent Orders table.
* **Product Catalog CRUD**: Add, edit, activate/deactivate, and delete packaging products with unit types (`Piece`, `Box`, `Packet`, `Roll`, `Sheet`, `Bundle`, `Dozen`, `Other`). Supports soft-deactivation safeguards for products with order history.
* **Category Management**: Create, edit, toggle active status, and arrange display order numbers.
* **Order Management**: Search by Hotel Name or Order Number (e.g., `ORD-000101`), filter by status (`New`, `Processing`, `Completed`, `Cancelled`), filter by date, inspect historical itemized price snapshots, and update order status.
* **Settings**: Configure incoming WhatsApp Business Number, Business Name, Currency symbol (`₹`), and Order Number prefix (`ORD-`).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (Node v22 installed)
- **Python**: v3.10+ (Python 3.12 installed)

### Starting the Servers

#### Method 1: Using the one-click script
Double-click `start.bat` or run:
```bash
./start.bat
```

#### Method 2: Manual Start

**Backend (FastAPI)**:
```bash
cd backend
python run.py
# Running on http://127.0.0.1:8000
```

**Frontend (React + Vite + Tailwind)**:
```bash
cd frontend
npm run dev
# Running on http://127.0.0.1:5173
```

---

## 🔐 Default Credentials

| Portal | URL | Username | Password |
| :--- | :--- | :--- | :--- |
| **Public Store** | `http://127.0.0.1:5173/` | *No login needed* | *No login needed* |
| **Admin Panel** | `http://127.0.0.1:5173/admin` | `MOHAN` | `MOHAN123` |

---

## 📦 Pre-Seeded Products & Categories

The database (`carry.db`) is automatically initialized with realistic Indian hotel packaging supplies:
- **Carry Bags**: SSP Carry Bag 16×20 (₹250 / Piece), SSP Carry Bag 18×24 (₹320 / Piece), Plastic Carry Bags (Small, Medium, Large)
- **Sheets**: Food Packing Sheet (₹180 / Packet), Butter Sheet (₹140 / Packet), Wrapping Sheet (₹160 / Packet)
- **Foil**: Aluminium Foil Small (₹190 / Roll), Aluminium Foil Large (₹320 / Roll)
- **Rolls**: Butter Paper Roll (₹250 / Roll), Packing Roll (₹220 / Roll), Tissue Roll (₹95 / Roll)
- **Containers**: Tulasi 500 (Piece & Box), Tulasi 750 Single Piece (₹8 / Piece), Tulasi 750 Box (₹350 / Box), Tulasi 1000 (Piece & Box)
- **Cups**: Tea Cup (₹45 / Packet), Coffee Cup (₹65 / Packet), Paper Cup (₹80 / Packet), Juice Cup (₹120 / Packet)
- **Others**: 5-Compartment Meal Tray with Lid, Wooden Cutlery Sets

---

## 🛡️ WhatsApp Message Layout Example

```text
CARRY ORDER
========================

HOTEL NAME:
Sri Krishna Hotel

ORDER DETAILS
------------------------

1. SSP Carry Bag 16×20
   Unit: Piece
   Quantity: 5
   Price: ₹250
   Total: ₹1,250

2. Tulasi 750 – Single Piece
   Unit: Piece
   Quantity: 20
   Price: ₹8
   Total: ₹160

3. Tulasi 750 – Box
   Unit: Box
   Quantity: 2
   Price: ₹350
   Total: ₹700

------------------------

TOTAL AMOUNT: ₹2,110

Thank you for ordering with Carry.
```
