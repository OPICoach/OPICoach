import pymysql
from .mysql_db_setup import get_db_connection  # 또는 본인의 위치에 맞게 import 경로 조정

def save_exam_result(user_pk: int, question: str, question_audio_path: str, user_answer: str, user_answer_audio_path: str, feedback: str, score: float = 0, exam_type: str = "default"):
    """
    피드백 결과를 exams 테이블에 저장합니다.
    :param user_pk: 사용자 기본키
    :param question: OPIC 질문
    :param question_audio_path: 질문 음성 파일 경로
    :param user_answer: 학생의 답변
    :param user_answer_audio_path: 학생 답변 음성 파일 경로
    :param feedback: 마크다운 형식의 피드백 텍스트
    :param score: 피드백 점수
    :param exam_type: 시험 유형
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()

        sql = """
        INSERT INTO exams (
            user_pk, question, question_audio_path, user_answer, user_answer_audio_path,
            feedback, score, exam_type
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(sql, (
            user_pk,
            question,
            question_audio_path,
            user_answer,
            user_answer_audio_path,
            feedback,
            score,
            exam_type
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
        SELECT question, question_audio_path, user_answer, user_answer_audio_path,
               feedback, score, exam_type, created_at
        FROM exams
        WHERE user_pk = %s
        ORDER BY created_at DESC
        """
        cursor.execute(sql, (user_pk,))
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"Error in load_exam_history: {e}")
        raise e
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'db' in locals():
            db.close()