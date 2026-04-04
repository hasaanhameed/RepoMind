from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()