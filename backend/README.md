# TaskFlow API

FastAPI service backing the TaskFlow client.

## Local development

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

Interactive API docs are served at http://localhost:8000/docs.
