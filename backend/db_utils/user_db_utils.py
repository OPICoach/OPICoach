import json
import pymysql
import bcrypt
from .mysql_db_setup import get_db_connection, hash_password  # database.py에서 함수 가져오기
from datetime import datetime

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
        
        sql = """
        INSERT INTO users (
            name, email, user_id, password_hash, 
            past_opic_level, goal_opic_level, 
            background, occupation_or_major, topics_of_interest,
            level_history
        ) VALUES (
            %s, %s, %s, %s, 
            'Or below', 'Or below', 
            'unemployed', 'none', '',
            '[]'
        )
        """
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
        user_pk = data.get('user_pk')
        past_opic_level = data.get('past_opic_level')
        goal_opic_level = data.get('goal_opic_level')
        background = data.get('background')
        occupation_or_major = data.get('occupation_or_major')
        topics_of_interest = data.get('topics_of_interest')
        is_initial_setup = data.get('is_initial_setup', False)  # 최초 설정 여부

        if not user_pk:
            return {'status': 'fail', 'message': '유저 식별 정보(pk)가 필요합니다.'}

        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)

        # 현재 유저 정보 조회
        cursor.execute("""
            SELECT past_opic_level, level_history 
            FROM users 
            WHERE id = %s
        """, (user_pk,))
        current_user = cursor.fetchone()

        if not current_user:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '해당 유저를 찾을 수 없습니다.'}

        updates = []
        params = []

        # level_history가 비어있을 때만 past_opic_level 업데이트 가능
        current_history = json.loads(current_user['level_history']) if current_user['level_history'] else []
        can_update_past_level = len(current_history) == 0

        if can_update_past_level and past_opic_level:
            if past_opic_level in ['AL', 'IH', 'IM', 'IL', 'Or below', 'No experience taking the test']:
                updates.append("past_opic_level = %s")
                params.append(past_opic_level)
                
                # 새로운 히스토리 추가
                new_history = {
                    "level": past_opic_level,
                    "progress": 0,
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                updates.append("level_history = %s")
                params.append(json.dumps([new_history]))
            else:
                cursor.close()
                db.close()
                return {'status': 'fail', 'message': '유효하지 않은 past_opic_level 값입니다.'}
        elif past_opic_level is not None and past_opic_level != current_user['past_opic_level']:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': 'past_opic_level은 초기 설정 이후 변경할 수 없습니다.'}

        if goal_opic_level in ['AL', 'IH', 'IM', 'IL', 'Or below']:
            updates.append("goal_opic_level = %s")
            params.append(goal_opic_level)
        elif goal_opic_level is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 goal_opic_level 값입니다.'}

        if background in ['student', 'office worker', 'freelancer', 'self employed', 'unemployed', 'part-time worker']:
            updates.append("background = %s")
            params.append(background)
        elif background is not None:
            cursor.close()
            db.close()
            return {'status': 'fail', 'message': '유효하지 않은 background 값입니다.'}

        if occupation_or_major is not None:
            updates.append("occupation_or_major = %s")
            params.append(occupation_or_major)

        if topics_of_interest is not None:
            # topics_of_interest를 문자열로 변환
            topics_str = ','.join(topics_of_interest) if isinstance(topics_of_interest, list) else str(topics_of_interest)
            updates.append("topics_of_interest = %s")
            params.append(topics_str)

        if updates:
            sql = f"""
                UPDATE users 
                SET {', '.join(updates)}
                WHERE id = %s
            """
            params.append(user_pk)
            cursor.execute(sql, params)
            db.commit()

        cursor.close()
        db.close()
        return {'status': 'success', 'message': '사용자 정보가 업데이트되었습니다.'}

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

        cursor.execute("""
            SELECT id, name, email, user_id, past_opic_level, goal_opic_level, 
                   background, occupation_or_major, topics_of_interest, 
                   level_history, progress 
            FROM users 
            WHERE id = %s
        """, (pk,))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if not user:
            return {'status': 'fail', 'message': '해당 유저를 찾을 수 없습니다.'}

        # level_history가 None이면 빈 배열로 설정
        if user['level_history'] is None:
            user['level_history'] = []
        else:
            # JSON 문자열을 파이썬 객체로 변환
            try:
                user['level_history'] = json.loads(user['level_history'])
                print(f"Debug - level_history: {user['level_history']}")  # 디버그 로그 추가
            except json.JSONDecodeError as e:
                print(f"Debug - JSON decode error: {e}")  # 디버그 로그 추가
                user['level_history'] = []

        print(f"Debug - Full user data: {user}")  # 디버그 로그 추가
        return {'status': 'success', 'user': user}

    except pymysql.Error as e:
        return {'status': 'fail', 'message': f'데이터베이스 오류: {str(e)}'}
    except Exception as e:
        return {'status': 'fail', 'message': f'서버 오류: {str(e)}'}

def update_user_progress(user_pk: int, score_change: float) -> dict:
    """
    사용자의 진행도를 업데이트합니다.
    진행도가 0 미만이면 0으로, 100 이상이면 다음 레벨로 업그레이드하고 진행도에서 100을 뺍니다.
    """
    try:
        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)

        # 현재 사용자 정보 조회
        cursor.execute("""
            SELECT past_opic_level, progress 
            FROM users 
            WHERE id = %s
        """, (user_pk,))
        user = cursor.fetchone()

        if not user:
            return {"status": "error", "message": "User not found"}

        current_level = user['past_opic_level']
        current_progress = user['progress']
        new_progress = current_progress + score_change

        # 진행도가 0 미만이면 0으로 설정
        if new_progress < 0:
            new_progress = 0
        # 진행도가 100 이상이면 다음 레벨로 업그레이드
        elif new_progress >= 100:
            # OPIC 레벨 순서
            level_order = ['Or below', 'IL', 'IM', 'IH', 'AL']
            current_index = level_order.index(current_level)
            
            # 다음 레벨이 있는 경우에만 업그레이드
            if current_index < len(level_order) - 1:
                new_level = level_order[current_index + 1]
                new_progress -= 100
                
                # 레벨과 진행도 업데이트
                cursor.execute("""
                    UPDATE users 
                    SET past_opic_level = %s, progress = %s 
                    WHERE id = %s
                """, (new_level, new_progress, user_pk))
                
        else:
            # 진행도만 업데이트
            cursor.execute("""
                UPDATE users 
                SET progress = %s 
                WHERE id = %s
            """, (new_progress, user_pk))

        # AL 레벨이면 진행도를 0으로 설정
        cursor.execute("SELECT past_opic_level FROM users WHERE id = %s", (user_pk,))
        updated_level = cursor.fetchone()['past_opic_level']
        if updated_level == "AL":
            cursor.execute("UPDATE users SET progress = 0 WHERE id = %s", (user_pk,))
            new_progress = 0

        db.commit()
        return {
            "status": "success",
            "current_level": updated_level,
            "new_progress": new_progress
        }
    except Exception as e:
        print(f"Error updating user progress: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        db.close()

def save_level_history(user_pk: int, level: str, score: float) -> dict:
    """
    사용자의 레벨 히스토리를 저장합니다.
    히스토리는 JSON 배열 형태로 저장되며, 각 항목은 {level: str, progress: float, date: str} 형식입니다.
    """
    try:
        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)

        # 현재 저장된 히스토리 가져오기
        cursor.execute("SELECT level_history, progress FROM users WHERE id = %s", (user_pk,))
        result = cursor.fetchone()
        
        if not result:
            return {"status": "error", "message": "User not found"}

        # JSON 문자열을 파이썬 리스트로 변환
        history = json.loads(result['level_history']) if result['level_history'] else []
        
        # 새로운 히스토리 추가
        new_history = {
            "level": level,  # 현재 past_opic_level
            "progress": result['progress'],  # 현재 progress
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        history.append(new_history)
        
        # 최대 10개의 최근 히스토리만 유지
        history = history[-10:]
        
        # 업데이트된 히스토리 저장
        cursor.execute(
            "UPDATE users SET level_history = %s WHERE id = %s",
            (json.dumps(history), user_pk)
        )
        
        db.commit()
        return {
            "status": "success",
            "history": history
        }
    except Exception as e:
        print(f"Error saving level history: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        db.close()