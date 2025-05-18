from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import users, exam, learning  # api 폴더 내 각각 모듈

from db_utils.mysql_db_setup import create_chat_logs_table, create_users_table

app = FastAPI(
    title="OPICoach API",
    description="OPICoach 백엔드 API 서버",
    version="1.0.0",
)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 각 모듈에서 라우터 가져와서 등록
app.include_router(users.router, prefix="/api/users")
app.include_router(exam.router, prefix="/api/exam")
app.include_router(learning.router, prefix="/api/learning")

@app.on_event("startup")
async def startup_event():
    print("서버 시작 - DB 테이블 생성 시도")
    try:
        create_users_table()
        create_chat_logs_table()
        print("DB 테이블 초기화 완료")
    except Exception as e:
        print(f"DB 초기화 오류: {e}")
