from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "last5min-optimizer"
    environment: str = "development"


settings = Settings()
