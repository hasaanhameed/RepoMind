from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.schemas.user import UserCreateRequest, UserLoginRequest
from app.services.hashing_service import hash_password

router = APIRouter(prefix="/user", tags=["User"])