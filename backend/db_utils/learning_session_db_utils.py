import pymysql
from datetime import datetime
from db_utils.mysql_db_setup import get_db_connection
from typing import Optional, Dict, List
from db_utils.chatlog_db_utils import load_chat_history
import json

def get_session_info(user_pk: int, session_pk: int) -> Optional[Dict]:
    """특정 학습 세션의 정보를 조회합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("""
                    SELECT id, user_pk, title, chat_content, created_at
                    FROM learning_sessions
                    WHERE id = %s AND user_pk = %s
                """, (session_pk, user_pk))
                session = cursor.fetchone()
                if session and session['chat_content']:
                    session['chat_history'] = json.loads(session['chat_content'])
                else:
                    session['chat_history'] = []
                return session
    except Exception as e:
        print(f"Error in get_session_info: {e}")
        return None

def get_user_learning_sessions(user_pk: int) -> List[Dict]:
    """사용자의 모든 학습 세션 목록을 조회합니다."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute("""
            SELECT * FROM learning_sessions 
            WHERE user_pk = %s
            ORDER BY created_at DESC
        """, (user_pk,))
        return cursor.fetchall()
    except Exception as e:
        print(f"❌ 학습 세션 목록 조회 실패: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def update_session_info(user_pk: int, session_pk: int, title: str = None) -> Dict:
    """학습 세션 정보를 업데이트합니다."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        print(f"🔄 세션 업데이트 시작: user_pk={user_pk}, session_pk={session_pk}, title={title}")
        
        # 먼저 세션이 존재하는지 확인
        cursor.execute("""
            SELECT id FROM learning_sessions
            WHERE user_pk = %s AND id = %s
        """, (user_pk, session_pk))
        
        if not cursor.fetchone():
            print(f"❌ 세션을 찾을 수 없음: user_pk={user_pk}, session_pk={session_pk}")
            return {
                "success": False,
                "message": "학습 세션을 찾을 수 없습니다.",
                "session_pk": session_pk
            }

        # chat_log 내용 조회
        messages = load_chat_history(user_pk, session_pk)
        chat_content = json.dumps(messages) if messages else None
        
        print(f"📝 채팅 내용: {chat_content}")
        
        # 세션 업데이트
        cursor.execute("""
            UPDATE learning_sessions 
            SET title = %s, chat_content = %s
            WHERE user_pk = %s AND id = %s
        """, (title, chat_content, user_pk, session_pk))
            
        conn.commit()
        print("✅ 세션 업데이트 완료")
            
        return {
            "success": True,
            "message": "학습 세션 정보가 업데이트되었습니다.",
            "session_pk": session_pk
        }
    except Exception as e:
        print(f"❌ 학습 세션 업데이트 실패: {e}")
        conn.rollback()
        return {
            "success": False,
            "message": f"학습 세션 업데이트 실패: {str(e)}",
            "session_pk": session_pk
        }
    finally:
        cursor.close()
        conn.close()

def create_learning_session(user_pk: int, title: str = None) -> Optional[int]:
    """새로운 학습 세션을 생성하고 생성된 세션의 id(session_pk)를 반환합니다.
    
    Args:
        user_pk (int): 사용자 PK
        title (str, optional): 세션 제목
        
    Returns:
        Optional[int]: 생성된 세션의 id(session_pk). 실패 시 None
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO learning_sessions (user_pk, title)
                    VALUES (%s, %s)
                """, (user_pk, title))
                conn.commit()
                
                # 생성된 세션의 id 반환
                return cursor.lastrowid
    except Exception as e:
        print(f"Error creating learning session: {e}")
        return None

def delete_learning_session(user_pk: int, session_pk: int) -> Dict:
    """학습 세션을 삭제합니다."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM learning_sessions 
            WHERE user_pk = %s AND id = %s
        """, (user_pk, session_pk))
        
        success = cursor.rowcount > 0
        conn.commit()
        return {
            "success": success,
            "message": "학습 세션이 삭제되었습니다." if success else "학습 세션을 찾을 수 없습니다.",
            "session_pk": session_pk if success else None
        }
    except Exception as e:
        print(f"❌ 학습 세션 삭제 실패: {e}")
        conn.rollback()
        return {
            "success": False,
            "message": f"학습 세션 삭제 실패: {str(e)}",
            "session_pk": None
        }
    finally:
        cursor.close()
        conn.close() 