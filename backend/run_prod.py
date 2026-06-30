import subprocess
import sys
import os

if __name__ == "__main__":
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    print("Building frontend...")
    result = subprocess.run(
        ['npm', 'run', 'build'],
        cwd=frontend_dir,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print("Frontend build failed:", result.stderr)
        sys.exit(1)
    print("Frontend built successfully!")

    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, workers=2)
