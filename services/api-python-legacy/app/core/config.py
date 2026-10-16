from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+psycopg://upgradeatlas_app:ua-dev-change-me@127.0.0.1:5432/upgradeatlas"
    app_env: str = "development"
    app_log_level: str = "INFO"


settings = Settings()
