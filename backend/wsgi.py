"""WSGI entry point for hosts that only run WSGI apps (e.g. PythonAnywhere's free plan).

FastAPI is an ASGI app, so it is wrapped with a2wsgi. WSGI servers don't send ASGI
lifespan events, so the database is created and seeded here instead of on startup.
"""

from a2wsgi import ASGIMiddleware

from app.main import app
from app.seed.seed import init_db

init_db()
application = ASGIMiddleware(app)
