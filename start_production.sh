#!/bin/bash
set -e

# Build frontend
cd frontend && npm run build && cd ..

# Start backend on port 8000 in background
cd backend && gunicorn --bind=0.0.0.0:8000 --workers=2 app.main:app &

# Serve frontend on port 5000 using a simple static server
cd frontend && npx serve dist -l 5000
