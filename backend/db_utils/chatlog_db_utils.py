# chatlog_db_utils.py
import pymysql
from .mysql_db_setup import get_db_connection  # MySQL 연결 함수 가져오기

def save_chat_history(user_id: int, session_id: str, messages: list):
    """MySQL에 채팅 기록을 저장합니다."""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        sql = "INSERT INTO chat_logs (user_id, session_id, role, content, timestamp) VALUES (%s, %s, %s, %s, NOW())"
        for message in messages:
            cursor.execute(sql, (user_id, session_id, message['role'], message['content']))
        db.commit()
        cursor.close()
        db.close()
    except pymysql.Error as e:
        print(f"MySQL 오류 발생: {e}")

def load_chat_history(session_id: str) -> list:
    """MySQL에서 특정 세션 ID의 채팅 기록을 불러옵니다."""
    history = []
    try:
        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)
        sql = "SELECT role, content FROM chat_logs WHERE session_id = %s ORDER BY timestamp"
        cursor.execute(sql, (session_id,))
        history = cursor.fetchall()
        cursor.close()
        db.close()
    except pymysql.Error as e:
        print(f"MySQL 오류 발생: {e}")
    return history

def get_chat_history_by_user_id(user_id: int) -> list:
    """MySQL에서 특정 사용자 ID의 모든 채팅 기록을 불러옵니다."""
    history = []
    try:
        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)
        sql = "SELECT session_id, role, content, timestamp FROM chat_logs WHERE user_id = %s ORDER BY timestamp"
        cursor.execute(sql, (user_id,))
        history = cursor.fetchall()
        cursor.close()
        db.close()
    except pymysql.Error as e:
        print(f"MySQL 오류 발생: {e}")
    return history