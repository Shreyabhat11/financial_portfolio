"""
Run this to verify the bcrypt fix works:
  python test_auth.py
"""
import sys

print(f"Python {sys.version}")

# Test 1: bcrypt standalone
try:
    import bcrypt
    pw = "testpassword123".encode("utf-8")[:72]
    hashed = bcrypt.hashpw(pw, bcrypt.gensalt())
    assert bcrypt.checkpw(pw, hashed), "checkpw failed"
    print("✅ bcrypt standalone: OK")
    BCRYPT_OK = True
except Exception as e:
    print(f"❌ bcrypt standalone: {e}")
    BCRYPT_OK = False

# Test 2: passlib fallback
if not BCRYPT_OK:
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        h = ctx.hash("testpassword123"[:72])
        assert ctx.verify("testpassword123"[:72], h)
        print("✅ passlib fallback: OK")
    except Exception as e:
        print(f"❌ passlib fallback: {e}")
        print("\n⚠️  Install bcrypt: pip install bcrypt")

# Test 3: JWT
try:
    from jose import jwt
    token = jwt.encode({"sub": "1"}, "secret", algorithm="HS256")
    payload = jwt.decode(token, "secret", algorithms=["HS256"])
    assert payload["sub"] == "1"
    print("✅ JWT (python-jose): OK")
except Exception as e:
    print(f"❌ JWT: {e}")

# Test 4: security module itself
try:
    from app.core.security import hash_password, verify_password
    h = hash_password("mypassword")
    assert verify_password("mypassword", h), "verify failed"
    assert not verify_password("wrongpassword", h), "should fail"
    print("✅ security.py hash_password / verify_password: OK")
except Exception as e:
    print(f"❌ security.py: {e}")

print("\nDone. If all green, restart uvicorn and try login again.")
