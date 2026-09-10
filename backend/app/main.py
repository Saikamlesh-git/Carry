from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .seed import seed_database
from .routes import auth, categories, products, orders, settings, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(
    title="Carry B2B Ordering API",
    description="Backend API for Carry - Hotel & Restaurant Packaging Essentials",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite development and cross-origin access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prevent aggressive browser/CDN caching so changes reflect immediately on all devices
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Include Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(settings.router)
app.include_router(stats.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Carry B2B API"}
