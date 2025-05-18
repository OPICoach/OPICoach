import pymysql
import bcrypt

# MySQL DB 설정
DB_HOST = 'localhost'
DB_PORT = 3306
DB_USER = 'root'
DB_PASSWD = '1234'
DB_NAME = 'new_schema'
DB_CHARSET = 'utf8mb4'

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        passwd=DB_PASSWD,
        db=DB_NAME,
        charset=DB_CHARSET
    )

def drop_tables():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("DROP TABLE IF EXISTS chat_logs")
    cursor.execute("DROP TABLE IF EXISTS users")
    db.commit()
    print("🗑️ Tables 'chat_logs' and 'users' dropped.")
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
            user_id INT NOT NULL,
            session_id VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        cursor.execute(create_table_query)
        print("🆕 Table 'chat_logs' created successfully.")
    cursor.close()
    db.close()

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def setup_all():
    # drop_tables()
    create_users_table()
    create_chat_logs_table()

if __name__ == "__main__":
    setup_all()
