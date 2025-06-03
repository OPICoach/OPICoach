import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import pymysql
from mysql_db_setup import get_db_connection, DB_NAME
from typing import List, Dict
import pandas as pd

def save_vocab_item(word: str, meaning: str) -> bool:
    """새로운 단어/숙어를 저장합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO vocab_items 
                    (word, meaning)
                    VALUES (%s, %s)
                """, (word, meaning))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error saving vocab item: {e}")
        return False

def get_vocab_items() -> List[Dict]:
    """단어/숙어 목록을 가져옵니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("""
                    SELECT * FROM vocab_items
                    ORDER BY word ASC
                """)
                return cursor.fetchall()
    except Exception as e:
        print(f"Error getting vocab items: {e}")
        return []

def update_vocab_item(item_id: int, word: str = None, meaning: str = None) -> bool:
    """단어/숙어 정보를 업데이트합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                update_fields = []
                params = []
                
                if word is not None:
                    update_fields.append("word = %s")
                    params.append(word)
                if meaning is not None:
                    update_fields.append("meaning = %s")
                    params.append(meaning)
                
                params.append(item_id)
                
                query = f"""
                    UPDATE vocab_items 
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                """
                cursor.execute(query, params)
                conn.commit()
                return True
    except Exception as e:
        print(f"Error updating vocab item: {e}")
        return False

def delete_vocab_item(item_id: int) -> bool:
    """단어/숙어를 삭제합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM vocab_items
                    WHERE id = %s
                """, (item_id,))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error deleting vocab item: {e}")
        return False

def get_review_items(user_pk: int, limit: int = 10) -> List[Dict]:
    """복습이 필요한 단어/숙어 목록을 가져옵니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("""
                    SELECT * FROM vocab_items
                    WHERE user_pk = %s
                    ORDER BY last_reviewed ASC
                    LIMIT %s
                """, (user_pk, limit))
                return cursor.fetchall()
    except Exception as e:
        print(f"Error getting review items: {e}")
        return []

def search_vocab_items(search_term: str) -> List[Dict]:
    """단어/숙어를 검색합니다."""
    try:
        with get_db_connection() as conn:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                search_pattern = f"%{search_term}%"
                cursor.execute("""
                    SELECT * FROM vocab_items
                    WHERE word LIKE %s OR meaning LIKE %s
                    ORDER BY word ASC
                """, (search_pattern, search_pattern))
                return cursor.fetchall()
    except Exception as e:
        print(f"Error searching vocab items: {e}")
        return []

def insert_vocab_from_excel(excel_path):
    """엑셀 파일에서 단어와 의미를 읽어 데이터베이스에 삽입합니다."""
    conn = None
    cursor = None
    try:
        df = pd.read_excel(excel_path)
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for _, row in df.iterrows():
            word = str(row['English']).strip()
            meaning = str(row['Korean']).strip()
            cursor.execute(
                "INSERT INTO vocab_items (word, meaning) VALUES (%s, %s)",
                (word, meaning)
            )
        
        conn.commit()
        print("✅ 단어장 데이터가 성공적으로 삽입되었습니다.")
        
    except Exception as e:
        print(f"❌ 단어장 데이터 삽입 중 오류 발생: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# 사용 예시 (직접 실행 시)
if __name__ == "__main__":
    xlsx_path = "./../vocab_db/vocab_idiom.xlsx"  # 엑셀 파일 경로를 맞게 수정하세요
    insert_vocab_from_excel(xlsx_path)