from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv

load_dotenv()

from app.auth.routes import router as auth_router
from app.projects.routes import router as projects_router

app = FastAPI(title="Web Builder API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")

# Serve Frontend static files
dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(dist_path):
    # Only mount assets if they exist to avoid errors
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{rest_of_path:path}")
    async def serve_frontend(rest_of_path: str):
        # API requests should not be caught by this
        if rest_of_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        return FileResponse(os.path.join(dist_path, "index.html"))

else:

    @app.get("/")
    async def root():
        return {
            "message": "Frontend not built yet. Run 'npm run build' in the frontend directory."
        }
