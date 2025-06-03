import pymysql
import bcrypt
from typing import Optional
import os

# MySQL DB 설정
DB_HOST = 'localhost'
DB_PORT = 3306
DB_USER = 'root'
DB_PASSWD = '1234'  # 기본 비밀번호 설정
DB_NAME = 'opicoach'
DB_CHARSET = 'utf8mb4'

def get_db_connection():
    """MySQL 데이터베이스 연결을 반환합니다."""
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", DB_HOST),
        user=os.getenv("MYSQL_USER", DB_USER),
        password=os.getenv("MYSQL_PASSWORD", DB_PASSWD),
        database=os.getenv("MYSQL_DATABASE", DB_NAME),
        charset=DB_CHARSET,
        cursorclass=pymysql.cursors.DictCursor
    )

def drop_tables():
    db = get_db_connection()
    cursor = db.cursor()
    # 외래 키를 참조하는 테이블부터 삭제
    cursor.execute("DROP TABLE IF EXISTS learning_notes")
    cursor.execute("DROP TABLE IF EXISTS chat_logs")
    cursor.execute("DROP TABLE IF EXISTS exams")
    cursor.execute("DROP TABLE IF EXISTS learning_sessions")
    cursor.execute("DROP TABLE IF EXISTS users")
    db.commit()
    print("🗑️ Tables 'learning_notes', 'chat_logs', 'exams', 'learning_sessions', 'users' dropped.")
    cursor.close()
    db.close()

def create_users_table():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SHOW TABLES LIKE 'users'")
    result = cursor.fetchone()
    if result:
        print("✅ Table 'users' already exists.")
    else:
        create_table_query = """
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            past_opic_level ENUM('AL', 'IH', 'IM', 'IL', 'Or below', 'No experience taking the test') NOT NULL,
            goal_opic_level ENUM('AL', 'IH', 'IM', 'IL', 'Or below') NOT NULL,
            background ENUM('student', 'office worker', 'freelancer', 'self employed', 'unemployed') NOT NULL,
            occupation_or_major ENUM('none', 'computer science', 'business administration', 'marketing', 'visual design', 'physical education') NOT NULL,
            topics_of_interest SET('shopping', 'movie', 'music', 'sports', 'reading books') NOT NULL DEFAULT '',
            progress FLOAT DEFAULT 0,
            level_history JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        print("🆕 Table 'users' created successfully.")
    cursor.close()
    db.close()

def create_chat_logs_table():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SHOW TABLES LIKE 'chat_logs'")
    result = cursor.fetchone()
    if result:
        print("✅ Table 'chat_logs' already exists.")
    else:
        create_table_query = """
        CREATE TABLE chat_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_pk INT NOT NULL,
            session_pk INT NOT NULL,
            messages JSON NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_pk) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (session_pk) REFERENCES learning_sessions(id) ON DELETE CASCADE
        )
        """
        cursor.execute(create_table_query)
        print("🆕 Table 'chat_logs' created successfully.")
    cursor.close()
    db.close()

def create_exams_table():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SHOW TABLES LIKE 'exams'")
    result = cursor.fetchone()
    if result:
        print("✅ Table 'exams' already exists.")
    else:
        create_table_query = """
        CREATE TABLE exams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_pk INT NOT NULL,
            question TEXT NOT NULL,
            question_audio_path VARCHAR(255),
            user_answer TEXT NOT NULL,
            user_answer_audio_path VARCHAR(255),
            feedback TEXT,
            score FLOAT DEFAULT 0,
            exam_type VARCHAR(50) DEFAULT 'default',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_pk) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        cursor.execute(create_table_query)
        print("🆕 Table 'exams' created successfully.")
    cursor.close()
    db.close()

def create_learning_notes_table():
    """학습 노트 테이블을 생성합니다."""
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        cursor.execute("SHOW TABLES LIKE 'learning_notes'")
        result = cursor.fetchone()
        if result:
            print("✅ Table 'learning_notes' already exists.")
        else:
            cursor.execute("""
                CREATE TABLE learning_notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_pk INT NOT NULL,
                    session_pk INT NOT NULL,
                    title VARCHAR(255),
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_pk) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (session_pk) REFERENCES learning_sessions(id) ON DELETE CASCADE
                )
            """)
            print("🆕 Table 'learning_notes' created successfully.")
    except Exception as e:
        print(f"❌ learning_notes 테이블 생성 실패: {e}")
        db.rollback()
    finally:
        cursor.close()
        db.close()

def create_learning_sessions_table():
    """학습 세션 정보를 저장하는 테이블을 생성합니다."""
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        cursor.execute("SHOW TABLES LIKE 'learning_sessions'")
        result = cursor.fetchone()
        if result:
            print("✅ Table 'learning_sessions' already exists.")
        else:
            cursor.execute("""
                CREATE TABLE learning_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_pk INT NOT NULL,
                    title VARCHAR(255),
                    chat_content TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_pk) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            print("🆕 Table 'learning_sessions' created successfully.")
    except Exception as e:
        print(f"❌ learning_sessions 테이블 생성 실패: {e}")
        db.rollback()
    finally:
        cursor.close()
        db.close()

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def setup_all():
    drop_tables()
    # users 테이블을 먼저 생성
    create_users_table()
    # 그 다음 외래키를 가진 테이블들 생성
    create_learning_sessions_table()  # learning_sessions를 먼저 생성
    create_chat_logs_table()  # chat_logs는 learning_sessions를 참조하므로 나중에 생성
    create_exams_table()
    create_learning_notes_table()

def init_db():
    """데이터베이스와 테이블을 초기화합니다."""
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST", DB_HOST),
        user=os.getenv("MYSQL_USER", DB_USER),
        password=os.getenv("MYSQL_PASSWORD", DB_PASSWD),
        charset=DB_CHARSET
    )
    
    try:
        with conn.cursor() as cursor:
            # 데이터베이스 생성
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {os.getenv('MYSQL_DATABASE', DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            cursor.execute(f"USE {os.getenv('MYSQL_DATABASE', DB_NAME)}")
            conn.commit()
            
            # 기존 테이블 삭제
            drop_tables()
            
            # 테이블 생성 (순서 중요)
            create_users_table()  # 먼저 users 테이블 생성
            create_learning_sessions_table()  # learning_sessions를 먼저 생성
            create_chat_logs_table()  # chat_logs는 learning_sessions를 참조하므로 나중에 생성
            create_exams_table()
            create_learning_notes_table()
            
            print("✅ 데이터베이스와 테이블이 성공적으로 초기화되었습니다.")
            
    except Exception as e:
        print(f"❌ 데이터베이스 초기화 중 오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
