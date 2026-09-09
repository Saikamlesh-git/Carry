from datetime import datetime, timezone
from sqlalchemy.orm import Session

from .database import SessionLocal, engine, Base
from .models import Admin, Category, Product, Order, OrderItem, Setting
from .auth import hash_password


def seed_database(db: Session = None):
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)

    close_db_at_end = False
    if db is None:
        db = SessionLocal()
        close_db_at_end = True

    try:
        # 1. Seed Admin MOHAN
        admin = db.query(Admin).filter(Admin.username == "MOHAN").first()
        if not admin:
            # Also check if legacy admin exists and update
            old_admin = db.query(Admin).filter(Admin.username == "admin").first()
            if old_admin:
                old_admin.username = "MOHAN"
                old_admin.password_hash = hash_password("MOHAN123")
            else:
                admin = Admin(
                    username="MOHAN",
                    password_hash=hash_password("MOHAN123"),
                    created_at=datetime.now(timezone.utc)
                )
                db.add(admin)
        else:
            admin.password_hash = hash_password("MOHAN123")
        db.commit()

        # 2. Seed Settings
        default_settings = {
            "business_name": ("Carry Hotel Supplies", "Trading & B2B Packaging Name"),
            "whatsapp_number": ("+919876543210", "WhatsApp Business Number for incoming orders"),
            "currency": ("₹", "Currency symbol"),
            "order_prefix": ("ORD-", "Prefix for generated orders")
        }
        for key, (val, desc) in default_settings.items():
            existing = db.query(Setting).filter(Setting.key == key).first()
            if not existing:
                db.add(Setting(key=key, value=val, description=desc))

        db.commit()

        # 3. Seed Categories
        categories_data = [
            {"name": "Carry Bags", "display_order": 1, "description": "High grade D-cut, W-cut and HDPE carry bags for restaurant takeaways."},
            {"name": "Sheets", "display_order": 2, "description": "Greaseproof food wrapping & butter sheets for hygienic packaging."},
            {"name": "Foil", "display_order": 3, "description": "Heavy duty commercial aluminium foil rolls."},
            {"name": "Rolls", "display_order": 4, "description": "Butter paper rolls, packing rolls and kitchen tissue rolls."},
            {"name": "Containers", "display_order": 5, "description": "Microwave-safe round & rectangular meal containers with airtight lids."},
            {"name": "Cups", "display_order": 6, "description": "Insulated paper cups, tea cups, coffee cups and juice tumblers."},
            {"name": "Others", "display_order": 7, "description": "Cutlery, toothpicks, meal trays and miscellaneous packaging supplies."}
        ]

        cat_map = {}
        for c_data in categories_data:
            cat = db.query(Category).filter(Category.name == c_data["name"]).first()
            if not cat:
                cat = Category(
                    name=c_data["name"],
                    display_order=c_data["display_order"],
                    description=c_data["description"],
                    is_active=True
                )
                db.add(cat)
                db.flush()
            cat_map[c_data["name"]] = cat.id

        db.commit()

        # 4. Seed Products
        products_data = [
            # Carry Bags
            {
                "name": "SSP Carry Bag 16×20",
                "category": "Carry Bags",
                "price": 250.0,
                "unit_type": "Piece",
                "sku": "CB-SSP-1620",
                "description": "Heavy-duty 16x20 SSP carry bag with reinforced handles, ideal for bulk parcels.",
                "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "SSP Carry Bag 18×24",
                "category": "Carry Bags",
                "price": 320.0,
                "unit_type": "Piece",
                "sku": "CB-SSP-1824",
                "description": "Large 18x24 jumbo carry bag designed for family meal combo packaging.",
                "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Plastic Carry Bag Small",
                "category": "Carry Bags",
                "price": 110.0,
                "unit_type": "Packet",
                "sku": "CB-PL-SML",
                "description": "Standard small carry bag packet (approx 100 pcs) for snacks and side orders.",
                "image_url": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Plastic Carry Bag Medium",
                "category": "Carry Bags",
                "price": 180.0,
                "unit_type": "Packet",
                "sku": "CB-PL-MED",
                "description": "Medium restaurant take-away carry bag packet with reliable load capacity.",
                "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Plastic Carry Bag Large",
                "category": "Carry Bags",
                "price": 260.0,
                "unit_type": "Packet",
                "sku": "CB-PL-LRG",
                "description": "Extra strong large grocery & meal container carry bags packet.",
                "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=80"
            },

            # Sheets
            {
                "name": "Food Packing Sheet",
                "category": "Sheets",
                "price": 180.0,
                "unit_type": "Packet",
                "sku": "SH-FP-100",
                "description": "Moisture-resistant food grade wrapping sheets for roti, naan and hot dishes.",
                "image_url": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Butter Sheet",
                "category": "Sheets",
                "price": 140.0,
                "unit_type": "Packet",
                "sku": "SH-BS-100",
                "description": "100% non-stick virgin butter paper sheets for baked items and snacks.",
                "image_url": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Wrapping Sheet",
                "category": "Sheets",
                "price": 160.0,
                "unit_type": "Packet",
                "sku": "SH-WS-100",
                "description": "High tensile strength brown kraft food parcel wrapping sheets.",
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
            },

            # Foil
            {
                "name": "Aluminium Foil Small",
                "category": "Foil",
                "price": 190.0,
                "unit_type": "Roll",
                "sku": "FL-AL-SML",
                "description": "11 micron food-grade aluminium foil roll (9 meter length) with cutter box.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Aluminium Foil Large",
                "category": "Foil",
                "price": 320.0,
                "unit_type": "Roll",
                "sku": "FL-AL-LRG",
                "description": "Commercial 18 micron extra heavy aluminium foil roll (25 meter length) for catering ovens.",
                "image_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=80"
            },

            # Rolls
            {
                "name": "Butter Paper Roll",
                "category": "Rolls",
                "price": 250.0,
                "unit_type": "Roll",
                "sku": "RL-BP-STD",
                "description": "Continuous premium butter paper roll for quick kitchen parcel wrapping.",
                "image_url": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Packing Roll",
                "category": "Rolls",
                "price": 220.0,
                "unit_type": "Roll",
                "sku": "RL-PK-STD",
                "description": "Protective cling wrap roll for sealing hotel plates, bowls and freshness.",
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Tissue Roll",
                "category": "Rolls",
                "price": 95.0,
                "unit_type": "Roll",
                "sku": "RL-TR-STD",
                "description": "Super absorbent 2-ply kitchen towel roll for chef stations & dining counters.",
                "image_url": "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500&auto=format&fit=crop&q=80"
            },

            # Containers
            {
                "name": "Tulasi 500 – Piece",
                "category": "Containers",
                "price": 6.0,
                "unit_type": "Piece",
                "sku": "CN-TL-500P",
                "description": "500ml Tulasi clear microwaveable round container with tight seal lid.",
                "image_url": "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Tulasi 500 – Box",
                "category": "Containers",
                "price": 290.0,
                "unit_type": "Box",
                "sku": "CN-TL-500B",
                "description": "Case box of 500ml Tulasi round containers (50 pcs per box).",
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Tulasi 750 – Single Piece",
                "category": "Containers",
                "price": 8.0,
                "unit_type": "Piece",
                "sku": "CN-TL-750P",
                "description": "750ml Tulasi round container with snug lid, standard for curry & biryani.",
                "image_url": "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Tulasi 750 – Box",
                "category": "Containers",
                "price": 350.0,
                "unit_type": "Box",
                "sku": "CN-TL-750B",
                "description": "Wholesale box of 750ml Tulasi containers (50 pcs per box).",
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Tulasi 1000 – Piece",
                "category": "Containers",
                "price": 11.0,
                "unit_type": "Piece",
                "sku": "CN-TL-1000P",
                "description": "1000ml family-size Tulasi leakproof takeaway container.",
                "image_url": "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Tulasi 1000 – Box",
                "category": "Containers",
                "price": 420.0,
                "unit_type": "Box",
                "sku": "CN-TL-1000B",
                "description": "Bulk box of 1000ml Tulasi containers (50 pcs per box).",
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
            },

            # Cups
            {
                "name": "Tea Cup",
                "category": "Cups",
                "price": 45.0,
                "unit_type": "Packet",
                "sku": "CP-TC-100",
                "description": "110ml disposable tea cup packet (100 cups) for chai & filter coffee service.",
                "image_url": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Coffee Cup",
                "category": "Cups",
                "price": 65.0,
                "unit_type": "Packet",
                "sku": "CP-CC-100",
                "description": "150ml ripple-insulated paper cup packet (100 cups) for hot beverages.",
                "image_url": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Paper Cup",
                "category": "Cups",
                "price": 80.0,
                "unit_type": "Packet",
                "sku": "CP-PC-100",
                "description": "210ml multi-purpose drinking water & soft drink paper cups (100 pcs).",
                "image_url": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Juice Cup",
                "category": "Cups",
                "price": 120.0,
                "unit_type": "Packet",
                "sku": "CP-JC-100",
                "description": "300ml crystal clear PET juice tumbler packet with dome lids (50 pcs).",
                "image_url": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500&auto=format&fit=crop&q=80"
            },

            # Others
            {
                "name": "Meal Tray with Lid",
                "category": "Others",
                "price": 15.0,
                "unit_type": "Piece",
                "sku": "OT-MT-LID",
                "description": "5-compartment disposable bento thali meal tray with anti-fog snap lid.",
                "image_url": "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=80"
            },
            {
                "name": "Wooden Cutlery Set",
                "category": "Others",
                "price": 75.0,
                "unit_type": "Packet",
                "sku": "OT-WC-SET",
                "description": "Eco-friendly birchwood spoon, fork & tissue pack (25 sets per packet).",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80"
            }
        ]

        created_prod_map = {}
        for p_data in products_data:
            cat_id = cat_map.get(p_data["category"])
            if not cat_id:
                continue
            existing_prod = db.query(Product).filter(Product.name == p_data["name"]).first()
            if not existing_prod:
                prod = Product(
                    name=p_data["name"],
                    category_id=cat_id,
                    price=p_data["price"],
                    unit_type=p_data["unit_type"],
                    sku=p_data["sku"],
                    description=p_data["description"],
                    image_url=p_data["image_url"],
                    is_active=True
                )
                db.add(prod)
                db.flush()
                created_prod_map[p_data["name"]] = prod
            else:
                created_prod_map[p_data["name"]] = existing_prod

        db.commit()

        # 5. Seed Initial Orders for realistic stats
        existing_orders_count = db.query(Order).count()
        if existing_orders_count == 0:
            # Order 1: Completed sample order matching the prompt's exact example
            order1 = Order(
                order_number="ORD-000101",
                hotel_name="Sri Krishna Hotel",
                total_amount=2110.0,
                status="Completed",
                created_at=datetime(2026, 9, 8, 13, 30, tzinfo=timezone.utc)
            )
            db.add(order1)
            db.flush()

            prod_ssp = created_prod_map.get("SSP Carry Bag 16×20")
            prod_tulasi_pc = created_prod_map.get("Tulasi 750 – Single Piece")
            prod_tulasi_bx = created_prod_map.get("Tulasi 750 – Box")

            if prod_ssp:
                db.add(OrderItem(
                    order_id=order1.id,
                    product_id=prod_ssp.id,
                    product_name_snapshot=prod_ssp.name,
                    unit_type_snapshot=prod_ssp.unit_type,
                    quantity=5,
                    price_snapshot=250.0,
                    total=1250.0
                ))
            if prod_tulasi_pc:
                db.add(OrderItem(
                    order_id=order1.id,
                    product_id=prod_tulasi_pc.id,
                    product_name_snapshot=prod_tulasi_pc.name,
                    unit_type_snapshot=prod_tulasi_pc.unit_type,
                    quantity=20,
                    price_snapshot=8.0,
                    total=160.0
                ))
            if prod_tulasi_bx:
                db.add(OrderItem(
                    order_id=order1.id,
                    product_id=prod_tulasi_bx.id,
                    product_name_snapshot=prod_tulasi_bx.name,
                    unit_type_snapshot=prod_tulasi_bx.unit_type,
                    quantity=2,
                    price_snapshot=350.0,
                    total=700.0
                ))

            # Order 2: New order
            order2 = Order(
                order_number="ORD-000102",
                hotel_name="Hotel Annapoorna",
                total_amount=2360.0,
                status="New",
                created_at=datetime(2026, 9, 9, 10, 15, tzinfo=timezone.utc)
            )
            db.add(order2)
            db.flush()

            prod_foil = created_prod_map.get("Aluminium Foil Large")
            prod_sheet = created_prod_map.get("Food Packing Sheet")
            prod_roll = created_prod_map.get("Butter Paper Roll")

            if prod_foil:
                db.add(OrderItem(
                    order_id=order2.id,
                    product_id=prod_foil.id,
                    product_name_snapshot=prod_foil.name,
                    unit_type_snapshot=prod_foil.unit_type,
                    quantity=3,
                    price_snapshot=320.0,
                    total=960.0
                ))
            if prod_sheet:
                db.add(OrderItem(
                    order_id=order2.id,
                    product_id=prod_sheet.id,
                    product_name_snapshot=prod_sheet.name,
                    unit_type_snapshot=prod_sheet.unit_type,
                    quantity=5,
                    price_snapshot=180.0,
                    total=900.0
                ))
            if prod_roll:
                db.add(OrderItem(
                    order_id=order2.id,
                    product_id=prod_roll.id,
                    product_name_snapshot=prod_roll.name,
                    unit_type_snapshot=prod_roll.unit_type,
                    quantity=2,
                    price_snapshot=250.0,
                    total=500.0
                ))

            db.commit()

        print("Database seeded successfully.")
    finally:
        if close_db_at_end:
            db.close()


if __name__ == "__main__":
    seed_database()
