from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    password: str

@router.post("/api/login")
async def login(req: LoginRequest, response: Response):
    if req.password == "flouvadmin":
        response.set_cookie(key="auth_token", value="secret-token", httponly=True, samesite="lax")
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Invalid password")

def verify_token(request: Request):
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication cookie")
    if token == "secret-token":
        return True
    raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/api/check-auth", dependencies=[Depends(verify_token)])
async def check_auth():
    return {"ok": True}
