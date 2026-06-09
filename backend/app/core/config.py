from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    GOOGLE_API_KEY: str
    ZERODHA_API_KEY: str
    ZERODHA_API_SECRET: str
    UPSTOX_API_KEY: str
    UPSTOX_API_SECRET: str
    UPSTOX_REDIRECT_URI: str

    class Config:
        env_file = ".env"


settings = Settings()

