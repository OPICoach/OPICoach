import pymysql
from datetime import datetime
from typing import List, Optional, Dict
from db_utils.mysql_db_setup import get_db_connection

def save_learning_note(user_pk: int, title: str, content: str, session_pk: int) -> Optional[int]:
    """학습 노트를 저장하고 생성된 노트의 id를 반환합니다."""
    try:
        print(f"\n📝 생성된 노트 내용:\n{content}")
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO learning_notes (user_pk, title, content, session_pk)
                    VALUES (%s, %s, %s, %s)
                """, (user_pk, title, content, session_pk))
                conn.commit()
                return cursor.lastrowid
    except Exception as e:
        print(f"Error saving learning note: {e}")
        return None

def get_learning_notes(user_pk: int, note_pk: str = None) -> Optional[List[Dict]]:
    """학습 노트를 조회합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                if note_pk:
                    cursor.execute("""
                        SELECT * FROM learning_notes
                        WHERE user_pk = %s AND id = %s
                    """, (user_pk, note_pk))
                    return cursor.fetchone()
                else:
                    cursor.execute("""
                        SELECT * FROM learning_notes
                        WHERE user_pk = %s
                        ORDER BY created_at DESC
                    """, (user_pk,))
                    return cursor.fetchall()
    except Exception as e:
        print(f"Error getting learning notes: {e}")
        return None

def delete_learning_note(user_pk: int, note_pk: int) -> bool:
    """학습 노트를 삭제합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM learning_notes
                    WHERE user_pk = %s AND id = %s
                """, (user_pk, note_pk))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error deleting learning note: {e}")
        return False 