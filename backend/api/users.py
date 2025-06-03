from fastapi import APIRouter
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse
import db_utils.user_db_utils as user_db_utils

router = APIRouter(tags=["Users"])


class SignupRequest(BaseModel):
    name: str = Field(..., description="사용자 이름")
    email: str = Field(..., description="사용자 이메일")
    id: str = Field(..., description="사용자 ID")
    pw: str = Field(..., description="사용자 비밀번호")


class LoginRequest(BaseModel):
    id: str = Field(..., description="사용자 ID")
    pw: str = Field(..., description="사용자 비밀번호")


class UpdateInfoRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK")
    past_opic_level: str | None = None
    goal_opic_level: str | None = None
    background: str | None = None
    occupation_or_major: str | None = None
    topics_of_interest: list[str] | None = None


@router.post("/signup")
async def signup(request: SignupRequest):
    response = user_db_utils.signup(request.dict())
    return JSONResponse(content=response)


@router.post("/login")
async def login(request: LoginRequest):
    response = user_db_utils.login(request.dict())
    return JSONResponse(content=response)


@router.post("/update_info")
async def update_info(request: UpdateInfoRequest):
    response = user_db_utils.update_info(request.dict())
    return JSONResponse(content=response)


@router.get("/info/{pk}")
async def get_user_info_route(pk: int):
    response = user_db_utils.get_user_info(pk)
    return JSONResponse(content=response)
