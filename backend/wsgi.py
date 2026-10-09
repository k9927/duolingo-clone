"""WSGI entry point for hosts that only run WSGI apps (e.g. PythonAnywhere's free plan).

FastAPI is an ASGI app, so it is wrapped with a2wsgi, which runs the ASGI event loop
on a background thread. WSGI servers such as uWSGI import this module once and then
fork worker processes, and threads don't survive a fork. So the wrapper is created
lazily on the first request inside each worker, and database connections opened
before the fork are discarded.

WSGI servers also don't send ASGI lifespan events, so the database is created and
seeded here instead of on startup.
"""

import threading

from a2wsgi import ASGIMiddleware

from app.database import engine
from app.main import app
from app.seed.seed import init_db

init_db()

_wrapped: ASGIMiddleware | None = None
_lock = threading.Lock()


def application(environ, start_response):
    global _wrapped
    if _wrapped is None:
        with _lock:
            if _wrapped is None:
                engine.dispose()  # connections from the parent process must not be shared
                _wrapped = ASGIMiddleware(app)
    return _wrapped(environ, start_response)
