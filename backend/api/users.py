from fastapi import APIRouter, Request, Path
from fastapi.responses import JSONResponse
import db_utils.user_db_utils as user_db_utils

router = APIRouter(tags=["Users"])

@router.post("/signup")
async def signup(request: Request):
    body = await request.body()
    response = user_db_utils.signup(body.decode("utf-8"))
    return JSONResponse(content=response)

@router.post("/login")
async def login(request: Request):
    body = await request.body()
    response = user_db_utils.login(body.decode("utf-8"))
    return JSONResponse(content=response)

@router.post("/update_info")
async def update_info(request: Request):
    body = await request.body()
    response = user_db_utils.update_info(body.decode("utf-8"))
    return JSONResponse(content=response)

@router.get("/info/{pk}")
def get_user_info_route(pk: int):
    response = user_db_utils.get_user_info(pk)
    return JSONResponse(content=response)
