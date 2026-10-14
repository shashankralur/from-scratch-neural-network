# Neural Lab

    neural-lab/
      backend/   neuron.py (the learning code) + main.py (API)
      src/       React app: components/ (Chart, CodePanel, Controls), stages/ (9 lessons)

Terminal 1:
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Terminal 2:
    npm install
    npm run dev
