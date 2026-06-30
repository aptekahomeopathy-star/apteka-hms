---
name: Auth setup quirks
description: Backend auth uses direct bcrypt import; Vite proxy hostname matters
---

## Rule
- Backend `backend/app/auth.py` must use `import bcrypt` directly and call `bcrypt.checkpw()`/`bcrypt.hashpw()`. Do NOT use `passlib.CryptContext` — it has a bcrypt version incompatibility that breaks password hashing silently.
- The Vite dev server proxy (`frontend/vite.config.ts`) must target `http://127.0.0.1:8000`, not `http://localhost:8000`. Using `localhost` causes 500 errors on the proxy under Replit's network stack.

**Why:** Discovered during initial setup — passlib's bcrypt wrapper conflicted with the installed bcrypt version. `localhost` DNS resolution behaves differently inside Replit containers.

**How to apply:** Any time auth or proxy config is touched, preserve these two constraints.
