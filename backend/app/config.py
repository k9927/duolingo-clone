"""Application settings, overridable through environment variables or a .env file."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ — the default database lives here whatever folder the server is started from
# (hosts such as PythonAnywhere don't start the app inside the project).
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = f"sqlite:///{(BACKEND_DIR / 'duolingo.db').as_posix()}"
    # Comma-separated list of allowed frontend origins.
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Optional regex (e.g. for Vercel preview deployments).
    cors_origin_regex: str | None = r"https://.*\.vercel\.app"

    default_username: str = "learner"
    default_timezone: str = "Asia/Kolkata"
    seed_on_startup: bool = True

    # Hearts
    max_hearts: int = 5
    heart_regen_minutes: int = 60
    heart_refill_gem_cost: int = 350

    # Shop
    streak_freeze_gem_cost: int = 200
    max_streak_freezes: int = 2

    # XP rewards
    lesson_xp: int = 10
    perfect_lesson_bonus_xp: int = 5
    practice_xp: int = 10
    legendary_xp: int = 40
    daily_goal_gems: int = 5  # chest opened the first time the daily goal is reached each day

    # Legendary challenge
    legendary_time_limit_seconds: int = 180
    legendary_max_mistakes: int = 3
    legendary_exercise_count: int = 10
    unit_test_exercise_count: int = 10
    unit_test_max_mistakes: int = 3
    unit_test_xp: int = 20

    practice_exercise_count: int = 8
    sounds_exercise_count: int = 8

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
