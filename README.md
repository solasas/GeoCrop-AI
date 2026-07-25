# GeoCrop AI: Crop Yield Prediction Platform

GeoCrop AI is a high-resolution Spatial AI application designed for **Crop Yield Prediction using Satellite Imagery & Weather Data Fusion**.

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, GeoPandas, Xarray, Google Earth Engine Python API (`earthengine-api`), GeoAlchemy2 / SQLAlchemy.
- **Frontend**: React 18, Vite, Tailwind CSS, Mapbox GL JS, Recharts, Lucide Icons.
- **Database**: PostgreSQL 15+ with PostGIS 3.3 extension.

---

## Quick Start

### 1. Database (PostgreSQL + PostGIS)
Start the spatial database container using Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend Setup (FastAPI)
Navigate to the `backend` directory, set up a virtual environment, install dependencies, and start the development server:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 3. Frontend Setup (React + Vite)
In a separate terminal, navigate to the `frontend` directory, install node modules, and launch Vite:

```bash
cd frontend
npm install
npm run dev
```
- App Dashboard: `http://localhost:5173`
