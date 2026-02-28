#!/bin/bash

# Clear existing log
> app.log

echo "Starting FastAPI backend on port 8002..."
cd backend
export PYTHONPATH=$PYTHONPATH:.
nohup uvicorn main:app --host 0.0.0.0 --port 8002 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started in background. (PID: $BACKEND_PID)"
cd ..

echo "Waiting for backend health check..."
for i in {1..10}; do
    if curl -s http://localhost:8002/api/health > /dev/null; then
        echo "Backend is healthy!"
        break
    fi
    echo "Waiting... ($i/10)"
    sleep 1
done

echo "Starting React frontend (Vite dev server)..."
cd frontend
nohup npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started in background. (PID: $FRONTEND_PID)"

echo "All services are running. Logs: backend.log, frontend.log"
