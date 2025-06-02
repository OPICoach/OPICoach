# api/learning.py
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional

from learning_mode import generate_learning_response, generate_learning_session, get_learning_session
from db_utils.learning_session_db_utils import (
    get_user_learning_sessions,
    update_session_info,
    delete_learning_session
)

router = APIRouter(tags=["Learning Mode"])

class LearningResponseRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    session_pk: int = Field(..., description="학습 세션 PK")
    question: str = Field(..., description="사용자의 질문")
    LLM_model: Optional[str] = Field(..., description="gemini-2.5-pro-preview-05-06 or gemini-2.0-flash. 기본값은 gemini-2.0-flash")

class LearningResponseResponse(BaseModel):
    answer: str

class LearningSessionRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    title: Optional[str] = Field(None, description="학습 세션 제목")

class LearningSessionResponse(BaseModel):
    success: bool = Field(..., description="요청 성공 여부")
    message: str = Field(..., description="응답 메시지")
    data: Optional[dict] = Field(None, description="세션 데이터")
    session_pk: Optional[int] = Field(None, description="세션 PK")

class GetSessionRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    session_pk: Optional[int] = Field(None, description="학습 세션 PK")

class UpdateSessionRequest(BaseModel):
    user_pk: int = Field(..., description="사용자 PK (DB 기본키)")
    session_pk: int = Field(..., description="학습 세션 PK")
    title: Optional[str] = Field(None, description="학습 세션 제목")

@router.post("/response", response_model=LearningResponseResponse)
async def api_generate_learning_response(request: LearningResponseRequest):
    """학습 모드에서 사용자의 질문에 대한 답변을 생성합니다."""
    try:
        # 세션 존재 여부 확인
        session = await get_learning_session(request.user_pk, request.session_pk)
        if not session:
            raise HTTPException(
                status_code=404,
                detail="존재하지 않는 학습 세션입니다."
            )
        
        if request.LLM_model not in ["gemini-2.5-pro-preview-05-06", "gemini-2.0-flash"]:
            request.LLM_model = "gemini-2.0-flash"  # 기본값 설정

        answer, _ = await generate_learning_response(
            user_pk=request.user_pk,
            question=request.question,
            session_pk=request.session_pk,
            _model_name=request.LLM_model
        )
        return {"answer": answer}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in /learning/response: {e}")
        raise HTTPException(status_code=500, detail="학습 응답 생성 중 오류가 발생했습니다.")

@router.post("/sessions/create", response_model=LearningSessionResponse)
async def api_create_learning_session(request: LearningSessionRequest):
    """새로운 학습 세션을 생성합니다."""
    try:
        # 새 세션 생성
        session = await generate_learning_session(
            user_pk=request.user_pk,
            title=request.title
        )
        
        return {
            "success": True,
            "message": "학습 세션이 성공적으로 생성되었습니다.",
            "data": session,
            "session_pk": session.get("id")
        }
    except Exception as e:
        print(f"Error in /learning/sessions/create: {e}")
        return {
            "success": False,
            "message": f"학습 세션 생성 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "session_pk": None
        }

@router.post("/sessions/get", response_model=LearningSessionResponse)
async def api_get_learning_sessions(request: GetSessionRequest):
    """학습 세션 정보를 조회합니다."""
    try:
        if request.session_pk:
            # 특정 세션 조회
            session = await get_learning_session(request.user_pk, request.session_pk)
            if not session:
                return {
                    "success": False,
                    "message": "학습 세션을 찾을 수 없습니다.",
                    "data": None,
                    "session_pk": request.session_pk
                }
            return {
                "success": True,
                "message": "학습 세션 조회가 완료되었습니다.",
                "data": session,
                "session_pk": request.session_pk
            }
        else:
            # 모든 세션 목록 조회
            sessions = get_user_learning_sessions(request.user_pk)
            return {
                "success": True,
                "message": "학습 세션 목록 조회가 완료되었습니다.",
                "data": {"sessions": sessions},
                "session_pk": None
            }
    except Exception as e:
        print(f"Error in /learning/sessions/get: {e}")
        return {
            "success": False,
            "message": f"학습 세션 조회 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "session_pk": request.session_pk if request.session_pk else None
        }

@router.post("/sessions/update", response_model=LearningSessionResponse)
async def api_update_session(request: UpdateSessionRequest):
    """학습 세션의 정보를 업데이트합니다."""
    try:
        result = update_session_info(request.user_pk, request.session_pk, request.title)
        if not result["success"]:
            return result
        
        # 업데이트된 세션 정보 조회
        session = await get_learning_session(request.user_pk, request.session_pk)
        
        return {
            "success": True,
            "message": "학습 세션 정보가 업데이트되었습니다.",
            "data": session,
            "session_pk": request.session_pk
        }
    except Exception as e:
        print(f"Error in /learning/sessions/update: {e}")
        return {
            "success": False,
            "message": f"학습 세션 정보 업데이트 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "session_pk": request.session_pk
        }

@router.post("/sessions/delete", response_model=LearningSessionResponse)
async def api_delete_learning_session(request: GetSessionRequest):
    """특정 학습 세션을 삭제합니다."""
    try:
        if not request.session_pk:
            return {
                "success": False,
                "message": "세션 PK가 필요합니다.",
                "data": None,
                "session_pk": None
            }
            
        result = delete_learning_session(request.user_pk, request.session_pk)
        return {
            "success": result["success"],
            "message": result["message"],
            "data": None,
            "session_pk": request.session_pk
        }
    except Exception as e:
        print(f"Error in /learning/sessions/delete: {e}")
        return {
            "success": False,
            "message": f"학습 세션 삭제 중 오류가 발생했습니다: {str(e)}",
            "data": None,
            "session_pk": request.session_pk
        }

