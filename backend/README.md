# OPICOACH BACKEND 환경 설정

# 가상 환경 설정
backend 디랙토리로 이동
python -m venv myenv         
myenv\Scripts\activate
pip install -r requirements.txt

# API 키 세팅
$env:OPENAI_API_KEY = "my_api_key"

# mysql 설치 및 설정
로컬 또는 원격 MySQL 서버가 실행 중이어야 합니다.
`db_utils` 폴더 내의의 `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWD`, `DB_NAME` 변수를 실제 MySQL 접속 정보로 수정해야 합니다.
지정된 `DB_NAME` 데이터베이스(스키마)는 미리 생성되어 있어야 합니다.

# 기본 mysql db (user, chat log)
python -m db_utils.mysql_db_setup

# chroma db 설정 (초기 1 회만)
python ./db_utils/chroma_db_setup.py

# fastapi 서버 열기
uvicorn server:app --reload