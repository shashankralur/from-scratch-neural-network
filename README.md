# Neural Lab

Terminal 1 (backend):
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Terminal 2 (frontend):
    npm install
    npm run dev
