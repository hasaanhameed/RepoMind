from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database.connection import get_db

from app.schemas.user import UserCreateRequest, UserLoginRequest

from app.services.hashing_service import hash_password
from app.services.hashing_service import verify_password
from app.services.token_service import create_access_token

router = APIRouter(prefix="/user", tags=["User"])

@router.post("/signup")
async def signup(user: UserCreateRequest, db: AsyncSession = Depends(get_db)):
    
    result = await db.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": user.email}
    )
    
    if result.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(user.password)

    await db.execute(
        text("""
            INSERT INTO users (name, email, password)
            VALUES (:name, :email, :password)
        """),
        {
            "name": user.name,
            "email": user.email,
            "password": hashed_password
        }
    )

    await db.commit()

    return {"message": "User created"}