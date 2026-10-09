from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.config import settings
from app.routers import course, dev, leaderboard, me, sessions, shop
from app.seed.seed import init_db
from app.services.errors import DomainError


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Duolingo Clone API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(DomainError)
async def domain_error_handler(_request: Request, exc: DomainError):
    return JSONResponse(status_code=exc.status_code, content={"code": exc.code, "message": exc.message})


@app.get("/", include_in_schema=False)
def root():
    """The API has no home page; send visitors (e.g. the hosted Space) to the interactive docs."""
    return RedirectResponse("/docs")


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}


for router in (me.router, course.router, sessions.router, leaderboard.router, shop.router, dev.router):
    app.include_router(router)
