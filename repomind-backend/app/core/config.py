from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    DATABASE_URL: str
    HF_TOKEN: str

    class Config:
        env_file = ".env"

settings = Settings()