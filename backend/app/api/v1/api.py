from fastapi import APIRouter
from app.api.v1.endpoints import health, fields, satellite

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(fields.router, prefix="/fields", tags=["Fields"])
api_router.include_router(satellite.router, prefix="/fields", tags=["Satellite & Weather Analytics"])
