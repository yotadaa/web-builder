#!/bin/bash

# Clear existing log
> app.log

echo "Starting FastAPI backend on port 8002..."
nohup uvicorn backend.main:app --host 0.0.0.0 --port 8002 >> app.log 2>&1 &
echo "Backend started in background. (PID: $!)"


echo "Starting React frontend (Vite dev server)..."
cd frontend
npm run build >> ../app.log 2>&1 &
echo "Success building frontend"

echo "All services are running. Check app.log for details."
