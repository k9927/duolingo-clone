---
title: Duolingo Clone API
emoji: 🦉
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Duolingo Clone API

FastAPI + SQLite backend of the [Duolingo clone](https://github.com/k9927/duolingo-clone).
The live API runs on PythonAnywhere through `wsgi.py`. The block above is only used if you deploy this folder as a Docker app on Hugging Face Spaces instead.

- Interactive API docs: `/docs`
- Health check: `/api/health`
- The SQLite database is created and seeded with demo data on first start.

See the [main README](../README.md) for setup, architecture, the database schema and the API overview.
