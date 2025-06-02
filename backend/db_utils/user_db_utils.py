import json
import pymysql
import bcrypt
from .mysql_db_setup import get_db_connection, hash_password  # database.py에서 함수 가져오기

def signup(data):
    try:
        name = data.get('name')
        email = data.get('email')
        user_id = data.get('id')
        pw = data.get('pw')

        if not all([name, email, user_id, pw]):
            return {'status': 'fail', 'message': '필수 정보가 누락되었습니다.'}

        db = get_db_connection()
        cursor = db.cursor()

        # 아이디 중복 확인
        cursor.execute("SELECT id FROM users WHERE user_id = %s", (user_id,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '이미 사용 중인 아이디입니다.'}

        hashed_password = hash_password(pw)
        sql = "INSERT INTO users (name, email, user_id, password_hash, past_opic_level, goal_opic_level, background, occupation_or_major, topics_of_interest) VALUES (%s, %s, %s, %s, 'No experience taking the test', 'Or below', 'unemployed', 'none', '')"
        cursor.execute(sql, (name, email, user_id, hashed_password))
        db.commit()
        user_pk = cursor.lastrowid

        cursor.close()
        db.close()
        return {'status': 'success', 'message': '회원가입 성공', 'pk': user_pk}

    except json.JSONDecodeError:
        return {'status': 'fail', 'message': '잘못된 JSON 형식입니다.'}
    except pymysql.Error as e:
        return {'status': 'fail', 'message': f'데이터베이스 오류: {str(e)}'}
    except Exception as e:
        return {'status': 'fail', 'message': f'서버 오류: {str(e)}'}

def login(data):
    try:
        user_id = data.get('id')
        pw = data.get('pw')

        if not all([user_id, pw]):
            return {'status': 'fail', 'message': '아이디 또는 비밀번호가 누락되었습니다.'}

        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT id, password_hash FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if user and bcrypt.checkpw(pw.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return {'status': 'success', 'message': '로그인 성공', 'pk': user['id']}
        else:
            return {'status': 'fail', 'message': '아이디 또는 비밀번호가 일치하지 않습니다.'}

    except json.JSONDecodeError:
        return {'status': 'fail', 'message': '잘못된 JSON 형식입니다.'}
    except pymysql.Error as e:
        return {'status': 'fail', 'message': f'데이터베이스 오류: {str(e)}'}
    except Exception as e:
        return {'status': 'fail', 'message': f'서버 오류: {str(e)}'}

def update_info(data):
    try:
        pk = data.get('user_pk') or data.get('pk')  # 클라이언트가 user_pk 또는 pk 키 중 하나라도 보내도록

        if not pk:
            return {'status': 'fail', 'message': '유저 식별 정보(pk)가 누락되었습니다.'}

        past_opic_level = data.get('past_opic_level')
        goal_opic_level = data.get('goal_opic_level')
        background = data.get('background')
        occupation_or_major = data.get('occupation_or_major')
        topics_of_interest = data.get('topics_of_interest')

        db = get_db_connection()
        cursor = db.cursor()

        sql = "UPDATE users SET "
        updates = []
        params = []

        if past_opic_level in ['AL', 'IH', 'IM', 'IL', 'Or below', 'No experience taking the test']:
            updates.append("past_opic_level = %s")
            params.append(past_opic_level)
        elif past_opic_level is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 past_opic_level 값입니다.'}

        if goal_opic_level in ['AL', 'IH', 'IM', 'IL', 'Or below']:
            updates.append("goal_opic_level = %s")
            params.append(goal_opic_level)
        elif goal_opic_level is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 goal_opic_level 값입니다.'}

        if background in ['student', 'office worker', 'freelancer', 'self employed', 'unemployed']:
            updates.append("background = %s")
            params.append(background)
        elif background is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 background 값입니다.'}

        if occupation_or_major in ['computer science', 'business administration', 'marketing', 'visual design', 'physical education']:
            updates.append("occupation_or_major = %s")
            params.append(occupation_or_major)
        elif occupation_or_major is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 occupation_or_major 값입니다.'}

        if isinstance(topics_of_interest, list) and all(topic in ['shopping', 'movie', 'music', 'sports', 'reading books'] for topic in topics_of_interest):
            updates.append("topics_of_interest = %s")
            params.append(','.join(topics_of_interest))
        elif topics_of_interest is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 topics_of_interest 값입니다.'}

        if not updates:
            cursor.close()
            db.close()
            return {'status': 'success', 'message': '수정할 정보가 없습니다.'}

        sql += ", ".join(updates) + " WHERE id = %s"
        params.append(pk)

        cursor.execute(sql, params)
        db.commit()

        cursor.close()
        db.close()
        return {'status': 'success', 'message': '정보 수정 성공'}

    except json.JSONDecodeError:
        return {'status': 'fail', 'message': '잘못된 JSON 형식입니다.'}
    except pymysql.Error as e:
        return {'status': 'fail', 'message': f'데이터베이스 오류: {str(e)}'}
    except Exception as e:
        return {'status': 'fail', 'message': f'서버 오류: {str(e)}'}

def get_user_info(pk):
    try:
        if not pk:
            return {'status': 'fail', 'message': '유저 식별 정보(pk)가 필요합니다.'}

        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT id, name, email, user_id, past_opic_level, goal_opic_level, background, occupation_or_major, topics_of_interest FROM users WHERE id = %s", (pk,))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if not user:
            return {'status': 'fail', 'message': '해당 유저를 찾을 수 없습니다.'}

        return {'status': 'success', 'user': user}

    except pymysql.Error as e:
        return {'status': 'fail', 'message': f'데이터베이스 오류: {str(e)}'}
    except Exception as e:
        return {'status': 'fail', 'message': f'서버 오류: {str(e)}'}