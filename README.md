# Campus Carpool

A web app that lets verified Western students share rides to other cities — cheaper and more flexible than coach buses, and safer than rideshare with strangers.

> **Status:** Setup (Nov 2026) · ADA Mentorship Program project

## Team

| Role | Name |
|---|---|
| Mentor | Seabar Omarzadeh |
| Project Manager | Sabrina Lee |
| Developer | Nahyun (Ellie) Kim |
| Developer | Lauren |
| Designer | Eman |

## Documentation

All technical docs live in [`/docs`](docs/) — see the [docs index](docs/README.md) for the full list.

Before contributing, read [CONTRIBUTING.md](CONTRIBUTING.md).

## Tech Stack

React (Vite) · Flask (JSON API) · PostgreSQL

## Getting Started

**Requirements:** Python 3.11+, Node.js 20+, Git

### 1. Backend (Flask) — runs on http://localhost:5001

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
flask --app wsgi run --port 5001
```

Check: open http://localhost:5001/api/health → `{"status": "ok"}`

> Port 5001, not 5000: on macOS, port 5000 is used by AirPlay Receiver.

### 2. Frontend (React) — runs on http://localhost:5173

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Check: open http://localhost:5173 → **Backend status: ok**

## Project Structure

```text
campus-carpool/
├── backend/
│   ├── app/
│   │   ├── __init__.py   # create_app(), CORS, blueprints
│   │   └── api.py        # API routes (/api/...)
│   ├── config.py         # settings from .env
│   ├── wsgi.py           # entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/             # React app (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   └── api.js        # all API calls go through here
│   └── .env.example
├── docs/                 # technical documentation
└── .github/              # PR and issue templates
```
