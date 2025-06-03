from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Response, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from exam_mode import generate_exam_question, generate_exam_feedback, speech_to_text
from db_utils.exam_db_utils import load_exam_history
import os
from pathlib import Path
import json

router = APIRouter(tags=["Exam Mode"]) 

class ExamFeedbackRequest(BaseModel):
    question: str = Field(..., description="LLM이 생성한 질문")
    question_number: int = Field(..., description="문제 번호")
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    exam_type: str = Field(default="default", description="시험 유형")
    LLM_model: str = Field("gemini-2.0-flash", description="gemini-2.5-pro-preview-05-06 or gemini-2.0-flash")

class ExamFeedbackResponse(BaseModel):
    feedback: str
    question: str
    question_audio: str  # base64 encoded audio data
    user_answer: str
    user_answer_audio: str  # base64 encoded audio data
    score: float
    exam_type: str

class ExamQuestionResponse(BaseModel):
    question: str
    question_mp3: bytes
    exam_type: str

class ExamHistoryItem(BaseModel):
    question: str
    question_audio_path: str
    user_answer: str
    user_answer_audio_path: str
    feedback: str
    score: float = 0
    exam_type: str = "default"
    created_at: datetime

class ExamHistoryResponse(BaseModel):
    history: List[ExamHistoryItem]

@router.get("/question")
async def get_exam_question(
    user_pk: int = Query(..., description="사용자 PK (DB 기본키)"),
    LLM_model: str = Query("gemini-2.0-flash", description="gemini-2.5-pro-preview-05-06 or gemini-2.0-flash")
):
    try:
        print(f"\n\033[1;33m🔍 API 호출: /question (user_pk: {user_pk}, model: {LLM_model})\033[0m")
        # 질문 생성
        question, question_audio_path, exam_type = await generate_exam_question(user_pk, with_type=True, _model_name=LLM_model)
        print(f"\n\033[1;32m✅ 질문 생성 완료:\033[0m {question}")
        print(f"\033[1;32m✅ 오디오 경로:\033[0m {question_audio_path}")
        print(f"\033[1;32m✅ 시험 유형:\033[0m {exam_type}")
        
        # question_number 추출 (question_{user_pk}_{number}.mp3)
        question_number = int(question_audio_path.split('_')[-1].split('.')[0])
        
        # HTML 태그 제거
        clean_question = question.replace('<br>', ' ').replace('<br/>', ' ').replace('<br />', ' ')
        
        # MP3 파일 읽기
        with open(question_audio_path, 'rb') as f:
            audio_content = f.read()
        
        # 응답 생성 (질문 텍스트와 MP3 파일)
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers={
                "X-Question-Text": clean_question,
                "X-Question-Number": str(question_number),
                "X-Exam-Type": exam_type,
                "Access-Control-Expose-Headers": "X-Question-Text, X-Question-Number, X-Exam-Type"
            }
        )
    except Exception as e:
        print(f"❌ API 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def api_generate_exam_feedback(
    request: str = Form(..., description="JSON string containing question, question_number, user_pk, exam_type, and LLM_model"),
    user_answer_audio: UploadFile = File(..., description="사용자의 음성 답변 파일")
):
    try:
        # JSON 문자열을 파싱
        request_data = json.loads(request)
        question = request_data.get("question")
        question_number = request_data.get("question_number")
        user_pk = request_data.get("user_pk")
        exam_type = request_data.get("exam_type", "default")
        LLM_model = request_data.get("LLM_model", "gemini-2.0-flash")

        if not all([question, question_number, user_pk]):
            return {
                "success": False,
                "message": "필수 파라미터가 누락되었습니다.",
                "data": None
            }

        # 음성 파일 저장
        audio_dir = Path("audio_files")
        audio_dir.mkdir(exist_ok=True)
        
        # 사용자 답변 MP3 파일 저장
        user_answer_audio_path = f"audio_files/user_answer_{user_pk}_{question_number}.mp3"
        try:
            content = await user_answer_audio.read()
            with open(user_answer_audio_path, "wb") as f:
                f.write(content)
            print(f"✅ 음성 파일 저장 완료: {user_answer_audio_path}")
        except Exception as e:
            print(f"❌ 음성 파일 저장 실패: {str(e)}")
            return {
                "success": False,
                "message": f"음성 파일 저장에 실패했습니다: {str(e)}",
                "data": None
            }

        # STT로 텍스트 변환
        try:
            print(f"🔍 STT 시작: {user_answer_audio_path}")
            user_answer = await speech_to_text(user_answer_audio_path)
            print(f"✅ STT 결과: {user_answer}")
            
            if not user_answer:
                print("❌ STT 결과가 비어있습니다")
                return {
                    "success": False,
                    "message": "음성 인식 결과가 비어있습니다.",
                    "data": None
                }
        except Exception as e:
            print(f"❌ STT 처리 실패: {str(e)}")
            return {
                "success": False,
                "message": f"음성 인식 처리 중 오류가 발생했습니다: {str(e)}",
                "data": None
            }
        
        # 피드백 생성
        try:
            print(f"🔍 피드백 생성 시작: {question}, {user_answer}")
            feedback_result = await generate_exam_feedback(
                question=question,
                user_answer=user_answer,
                user_pk=user_pk,
                question_number=question_number,
                exam_type=exam_type,
                _model_name=LLM_model
            )
            print(f"✅ 피드백 생성 완료: {feedback_result}")
        except Exception as e:
            print(f"❌ 피드백 생성 실패: {str(e)}")
            return {
                "success": False,
                "message": f"피드백 생성 중 오류가 발생했습니다: {str(e)}",
                "data": None
            }

        # 질문 오디오 파일 경로
        question_audio_path = f"audio_files/question_{user_pk}_{question_number}.mp3"

        return {
            "success": True,
            "message": "피드백이 성공적으로 생성되었습니다.",
            "data": {
                "feedback": feedback_result["feedback"],
                "question": question,
                "user_answer": user_answer,
                "question_audio_path": question_audio_path,
                "user_answer_audio_path": user_answer_audio_path,
                "exam_type": exam_type,
                "score": feedback_result["score"]
            }
        }

    except json.JSONDecodeError:
        print("❌ JSON 파싱 실패")
        return {
            "success": False,
            "message": "잘못된 JSON 형식입니다.",
            "data": None
        }
    except Exception as e:
        print(f"❌ 전체 프로세스 실패: {str(e)}")
        return {
            "success": False,
            "message": f"피드백 생성 중 오류가 발생했습니다: {str(e)}",
            "data": None
        }

@router.get("/audio/{file_path:path}")
async def get_audio_file(file_path: str):
    """오디오 파일을 제공하는 엔드포인트"""
    try:
        audio_path = Path(file_path)
        if not audio_path.exists():
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename=audio_path.name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=ExamHistoryResponse)
async def get_exam_history(user_pk: int = Query(..., description="사용자 PK (DB 기본키)")):
    try:
        history = load_exam_history(user_pk)
        return {"history": history}
    except Exception as e:
        print(f"Error in /api/exam/history: {e}")
        raise HTTPException(status_code=500, detail="시험 기록 불러오기 중 오류가 발생했습니다.")