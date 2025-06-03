import pymysql
from .mysql_db_setup import get_db_connection  # MySQL 연결 함수 가져오기
import json
from typing import List, Dict, Optional

def save_chat_history(user_pk: int, session_pk: int, messages: List[Dict]) -> bool:
    """채팅 기록을 저장합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # 기존 기록 삭제 후 새로운 기록 저장
                cursor.execute("""
                    DELETE FROM chat_logs
                    WHERE user_pk = %s AND session_pk = %s
                """, (user_pk, session_pk))
                
                # 새로운 채팅 기록 저장
                cursor.execute("""
                    INSERT INTO chat_logs (user_pk, session_pk, messages)
                    VALUES (%s, %s, %s)
                """, (user_pk, session_pk, json.dumps(messages)))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error saving chat history: {e}")
        return False

def load_chat_history(user_pk: int, session_pk: int) -> Optional[List[Dict]]:
    """채팅 기록을 로드합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("""
                    SELECT messages FROM chat_logs
                    WHERE user_pk = %s AND session_pk = %s
                """, (user_pk, session_pk))
                results = cursor.fetchall()
                all_messages = []
                if results:
                    for result in results:
                        if result and result['messages']:
                            all_messages.extend(json.loads(result['messages']))
                return all_messages
    except Exception as e:
        print(f"Error loading chat history: {e}")
        return []

def delete_chat_history(user_pk: int, session_pk: int) -> bool:
    """채팅 기록을 삭제합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM chat_logs
                    WHERE user_pk = %s AND session_pk = %s
                """, (user_pk, session_pk))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error deleting chat history: {e}")
        return False