from datetime import datetime, timedelta

from jose import jwt
from app.core.config import settings

# ── bcrypt ────────────────────────────────────────────────────────────────────
# passlib has a bug with newer bcrypt versions on Python 3.13/3.14 Windows:
#   "password cannot be longer than 72 bytes"
# We call bcrypt directly instead, which is clean and has no such bug.
try:
    import bcrypt as _bcrypt

    def hash_password(password: str) -> str:
        # bcrypt only hashes bytes; encode first. Truncate at 72 bytes (bcrypt limit).
        pw_bytes = password.encode("utf-8")[:72]
        return _bcrypt.hashpw(pw_bytes, _bcrypt.gensalt()).decode("utf-8")

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return _bcrypt.checkpw(pw_bytes, hash_bytes)

except ImportError:
    # Fallback to passlib if bcrypt standalone isn't installed
    from passlib.context import CryptContext
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(password: str) -> str:
        return _pwd_context.hash(password[:72])

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return _pwd_context.verify(plain_password[:72], hashed_password)


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
