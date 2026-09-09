import sys
import io
import json

# Ensure stdout supports utf-8
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_api():
    print("=== 1. Testing Health ===")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("Health OK:", res.json())

    print("\n=== 2. Testing Public Categories ===")
    res = client.get("/api/categories")
    assert res.status_code == 200, res.text
    categories = res.json()
    cat_names = [c["name"] for c in categories]
    print(f"Categories count: {len(categories)}, names: {cat_names}")
    assert "Carry Bags" in cat_names
    assert "Containers" in cat_names

    print("\n=== 3. Testing Public Products ===")
    res = client.get("/api/products")
    assert res.status_code == 200, res.text
    products = res.json()
    print(f"Total active products: {len(products)}")
    assert len(products) >= 20

    # Test Search
    print("\n=== 4. Testing Search Query 'Tulasi' ===")
    res = client.get("/api/products?q=Tulasi")
    assert res.status_code == 200, res.text
    tulasi_prods = res.json()
    print(f"Tulasi products found: {len(tulasi_prods)}")
    for p in tulasi_prods:
        print(f"  - {p['name']} ({p['price']} / {p['unit_type']})")
    assert len(tulasi_prods) >= 2

    # Test Category Filter
    containers_cat = next(c for c in categories if c["name"] == "Containers")
    res = client.get(f"/api/products?category_id={containers_cat['id']}")
    assert res.status_code == 200, res.text
    container_prods = res.json()
    print(f"Container products found: {len(container_prods)}")
    assert len(container_prods) >= 4

    # Test Public Settings
    print("\n=== 5. Testing Public Settings ===")
    res = client.get("/api/settings/public")
    assert res.status_code == 200, res.text
    settings = res.json()
    print("Settings:", settings)
    assert "whatsapp_number" in settings

    # Test Create Order
    print("\n=== 6. Testing Order Creation ===")
    p1 = products[0]
    p2 = products[1]
    order_payload = {
        "hotel_name": "Test Grand Palace Hotel",
        "items": [
            {"product_id": p1["id"], "quantity": 3},
            {"product_id": p2["id"], "quantity": 2}
        ],
        "notes": "Fast delivery please"
    }
    res = client.post("/api/orders", json=order_payload)
    assert res.status_code == 201, res.text
    new_order = res.json()
    print(f"Order created: {new_order['order_number']}, Total: {new_order['total_amount']}, Items: {len(new_order['items'])}")
    expected_total = round(p1["price"] * 3 + p2["price"] * 2, 2)
    assert new_order["total_amount"] == expected_total

    # Test Admin Login
    print("\n=== 7. Testing Admin Authentication ===")
    # Bad credentials
    res = client.post("/api/admin/login", json={"username": "MOHAN", "password": "wrongpassword"})
    assert res.status_code == 401, "Expected 401 on wrong password"

    # Good credentials
    res = client.post("/api/admin/login", json={"username": "MOHAN", "password": "MOHAN123"})
    assert res.status_code == 200, res.text
    auth_data = res.json()
    token = auth_data["access_token"]
    print("Admin login success, token received:", token[:20] + "...")

    headers = {"Authorization": f"Bearer {token}"}

    # Test Admin Stats
    print("\n=== 8. Testing Admin Stats ===")
    res = client.get("/api/admin/stats", headers=headers)
    assert res.status_code == 200, res.text
    stats = res.json()
    print("Dashboard Stats:", stats)
    assert stats["total_products"] >= 20
    assert stats["total_orders"] >= 3

    # Test Admin Product Management (Add Product)
    print("\n=== 9. Testing Admin Add Product ===")
    new_prod_payload = {
        "name": "Test Biodegradable Bag",
        "description": "Eco-friendly cornstarch carry bag",
        "category_id": categories[0]["id"],
        "price": 310.0,
        "unit_type": "Packet",
        "sku": "CB-TEST-BIO",
        "is_active": True
    }
    res = client.post("/api/admin/products", json=new_prod_payload, headers=headers)
    assert res.status_code == 201, res.text
    created_prod = res.json()
    print("Created test product:", created_prod["name"], "ID:", created_prod["id"])

    # Test Update Product
    res = client.put(f"/api/admin/products/{created_prod['id']}", json={"price": 325.0}, headers=headers)
    assert res.status_code == 200, res.text
    assert res.json()["price"] == 325.0
    print("Updated product price to 325.0")

    # Test Delete Product
    res = client.delete(f"/api/admin/products/{created_prod['id']}", headers=headers)
    assert res.status_code == 200, res.text
    print("Deleted test product:", res.json())

    # Test Admin Orders List
    print("\n=== 10. Testing Admin Orders List & Status Update ===")
    res = client.get("/api/admin/orders", headers=headers)
    assert res.status_code == 200, res.text
    admin_orders = res.json()
    print(f"Admin orders retrieved: {len(admin_orders)}")

    # Update status of newly created order
    res = client.patch(f"/api/admin/orders/{new_order['id']}/status", json={"status": "Processing"}, headers=headers)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "Processing"
    print(f"Updated order {new_order['order_number']} status to Processing")

    # Delete order
    res = client.delete(f"/api/admin/orders/{new_order['id']}", headers=headers)
    assert res.status_code == 200, res.text
    print(f"Deleted order {new_order['order_number']} successfully: {res.json()['message']}")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_api()
