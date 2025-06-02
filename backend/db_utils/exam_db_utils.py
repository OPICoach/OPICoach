import pymysql
from .mysql_db_setup import get_db_connection  # 또는 본인의 위치에 맞게 import 경로 조정

def save_exam_result(user_pk: int, question: str, user_answer: str, feedback: dict):
    """
    피드백 결과를 exams 테이블에 저장합니다.
    :param user_pk: 사용자 기본키
    :param question: OPIC 질문
    :param user_answer: 학생의 답변
    :param feedback: {"Good Point": ..., "Bad Point": ..., "Overall Feedback": ..., "Teacher's Answer": ...}
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()

        sql = """
        INSERT INTO exams (
            user_pk, question, user_answer,
            good_point, bad_point, overall_feedback, teachers_answer
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(sql, (
            user_pk,
            question,
            user_answer,
            feedback.get("Good Point", ""),
            feedback.get("Bad Point", ""),
            feedback.get("Overall Feedback", ""),
            feedback.get("Teacher's Answer", "")
        ))

        db.commit()
        print("✅ 시험 결과가 저장되었습니다.")
    except pymysql.Error as e:
        print(f"MySQL 저장 중 오류 발생: {e}")
    finally:
        cursor.close()
        db.close()


def load_exam_history(user_pk: int) -> list:
    """
    특정 유저의 모든 시험 결과를 시간순으로 불러옵니다.
    """
    results = []
    try:
        db = get_db_connection()
        cursor = db.cursor(pymysql.cursors.DictCursor)

        sql = """
        SELECT question, user_answer, good_point, bad_point, overall_feedback, teachers_answer, created_at
        FROM exams
        WHERE user_pk = %s
        ORDER BY created_at DESC
        """

        cursor.execute(sql, (user_pk,))
        results = cursor.fetchall()
    except pymysql.Error as e:
        print(f"MySQL 불러오기 오류 발생: {e}")
    finally:
        cursor.close()
        db.close()
    return results