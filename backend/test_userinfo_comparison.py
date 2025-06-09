import asyncio
from exam_mode import ask_llm, load_prompt_template, user_info_to_str
from db_utils.user_db_utils import get_user_info
import json
from datetime import datetime
import os
from sentence_transformers import SentenceTransformer
import numpy as np

# 문장 임베딩 모델 로드
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def filter_user_info(user_info: dict) -> dict:
    """OPIC 레벨 정보를 제외한 사용자 정보를 반환합니다."""
    if not user_info or user_info.get('status') != 'success':
        return user_info
    
    filtered_info = user_info.copy()
    if 'user' in filtered_info:
        user = filtered_info['user'].copy()
        # OPIC 레벨 정보 완전 제거
        user.pop('past_opic_level', None)
        user.pop('goal_opic_level', None)
        filtered_info['user'] = user
    return filtered_info

def extract_user_keywords(user_info: dict) -> list:
    """유저 정보에서 키워드를 추출합니다."""
    keywords = []
    if 'user' in user_info:
        user = user_info['user']
        if 'background' in user:
            keywords.append(user['background'].lower())
        if 'occupation_or_major' in user:
            keywords.append(user['occupation_or_major'].lower())
        if 'topics_of_interest' in user:
            topics = user['topics_of_interest'].split(',')
            keywords.extend(topic.strip().lower() for topic in topics)
    return keywords

def calculate_explicit_matching_score(question: str, keywords: list) -> float:
    """명시적 정보 일치율을 계산합니다."""
    question_lower = question.lower()
    matched_keywords = [kw for kw in keywords if kw in question_lower]
    return len(matched_keywords) / len(keywords) if keywords else 0

def calculate_semantic_similarity(text1: str, keywords: list) -> float:
    """문제와 각 키워드 간의 의미적 유사도의 평균을 계산합니다."""
    if not keywords:
        return 0.0
    
    # 문제와 모든 키워드의 임베딩을 한 번에 계산
    texts = [text1] + keywords
    embeddings = model.encode(texts)
    question_embedding = embeddings[0]
    keyword_embeddings = embeddings[1:]
    
    # 각 키워드와의 유사도 계산
    similarities = []
    for keyword_embedding in keyword_embeddings:
        similarity = np.dot(question_embedding, keyword_embedding) / (np.linalg.norm(question_embedding) * np.linalg.norm(keyword_embedding))
        similarities.append(float(similarity))
    
    # 평균 유사도 반환
    return sum(similarities) / len(similarities)

async def compare_with_without_user_info(user_pk: int, num_questions: int = 100):
    """유저 정보 포함 여부에 따른 문제 생성 결과 비교"""
    # 사용자 정보 가져오기
    user_info = get_user_info(user_pk)
    filtered_user_info = filter_user_info(user_info)
    user_info_str = user_info_to_str(filtered_user_info)
    user_info_str = user_info_str.replace("past_opic_level: N/A, ", "").replace("goal_opic_level: N/A, ", "")
    
    # 유저 키워드 추출
    user_keywords = extract_user_keywords(filtered_user_info)
    
    prompt_template = await load_prompt_template("prompt/prompt_makeexam.txt")
    
    print("\n=== 유저 정보를 제외한 프롬프트 ===")
    prompt_without_user = prompt_template.format(
        user_info="",
        context=""
    )
    print(prompt_without_user)
    
    print("\n=== 유저 정보를 제외한 문제 생성 ===")
    questions_without_user = []
    for i in range(num_questions):
        print(f"문제 {i+1}/{num_questions} 생성 중...")
        # 새로운 대화 시작을 위한 시스템 메시지 추가
        system_msg = "You are starting a completely new conversation. Generate a question based ONLY on the given prompt. DO NOT reference any user information or previous context."
        question = await ask_llm("", "", system_msg, prompt_without_user, __model_name="gemini-2.0-flash")
        clean_question = question.replace('<br>', ' ').replace('<br/>', ' ').replace('<br />', ' ')
        questions_without_user.append(clean_question)
        print(f"생성된 문제:\n{clean_question}\n")
    
    print("\n=== 유저 정보를 포함한 프롬프트 ===")
    prompt_with_user = prompt_template.format(
        user_info=user_info_str,
        context=""
    )
    print(prompt_with_user)
    
    print("\n=== 유저 정보를 포함한 문제 생성 ===")
    questions_with_user = []
    for i in range(num_questions):
        print(f"문제 {i+1}/{num_questions} 생성 중...")
        # 새로운 대화 시작을 위한 시스템 메시지 추가
        system_msg = "You are starting a completely new conversation. Generate a question based ONLY on the given prompt. DO NOT reference any user information or previous context."
        question = await ask_llm("", "", system_msg, prompt_with_user, __model_name="gemini-2.0-flash")
        clean_question = question.replace('<br>', ' ').replace('<br/>', ' ').replace('<br />', ' ')
        questions_with_user.append(clean_question)
        print(f"생성된 문제:\n{clean_question}\n")
    
    # 평가 점수 계산
    explicit_scores_with_user = [calculate_explicit_matching_score(q, user_keywords) for q in questions_with_user]
    explicit_scores_without_user = [calculate_explicit_matching_score(q, user_keywords) for q in questions_without_user]
    
    semantic_scores_with_user = [calculate_semantic_similarity(q, user_keywords) for q in questions_with_user]
    semantic_scores_without_user = [calculate_semantic_similarity(q, user_keywords) for q in questions_without_user]
    
    # 평균 점수 계산
    avg_explicit_with_user = sum(explicit_scores_with_user) / len(explicit_scores_with_user)
    avg_explicit_without_user = sum(explicit_scores_without_user) / len(explicit_scores_without_user)
    avg_semantic_with_user = sum(semantic_scores_with_user) / len(semantic_scores_with_user)
    avg_semantic_without_user = sum(semantic_scores_without_user) / len(semantic_scores_without_user)
    
    # 각 평가 방식에서 가장 높은 점수를 받은 문제 찾기
    best_explicit_with_user_idx = explicit_scores_with_user.index(max(explicit_scores_with_user))
    best_explicit_without_user_idx = explicit_scores_without_user.index(max(explicit_scores_without_user))
    best_semantic_with_user_idx = semantic_scores_with_user.index(max(semantic_scores_with_user))
    best_semantic_without_user_idx = semantic_scores_without_user.index(max(semantic_scores_without_user))
    
    print("\n=== 평가 점수 분석 결과 ===")
    print(f"유저 정보를 포함한 문제들의 평균 명시적 일치율: {avg_explicit_with_user:.2%}")
    print(f"유저 정보를 제외한 문제들의 평균 명시적 일치율: {avg_explicit_without_user:.2%}")
    print(f"유저 정보를 포함한 문제들의 평균 의미적 유사도: {avg_semantic_with_user:.4f}")
    print(f"유저 정보를 제외한 문제들의 평균 의미적 유사도: {avg_semantic_without_user:.4f}")
    
    # 결과 저장
    results = {
        "user_info": user_info_str,
        "user_keywords": user_keywords,
        "questions_with_user": questions_with_user,
        "questions_without_user": questions_without_user,
        "explicit_scores_with_user": explicit_scores_with_user,
        "explicit_scores_without_user": explicit_scores_without_user,
        "semantic_scores_with_user": semantic_scores_with_user,
        "semantic_scores_without_user": semantic_scores_without_user,
        "avg_explicit_with_user": float(avg_explicit_with_user),
        "avg_explicit_without_user": float(avg_explicit_without_user),
        "avg_semantic_with_user": float(avg_semantic_with_user),
        "avg_semantic_without_user": float(avg_semantic_without_user),
        "best_questions": {
            "explicit_with_user": {
                "question": questions_with_user[best_explicit_with_user_idx],
                "score": float(explicit_scores_with_user[best_explicit_with_user_idx])
            },
            "explicit_without_user": {
                "question": questions_without_user[best_explicit_without_user_idx],
                "score": float(explicit_scores_without_user[best_explicit_without_user_idx])
            },
            "semantic_with_user": {
                "question": questions_with_user[best_semantic_with_user_idx],
                "score": float(semantic_scores_with_user[best_semantic_with_user_idx])
            },
            "semantic_without_user": {
                "question": questions_without_user[best_semantic_without_user_idx],
                "score": float(semantic_scores_without_user[best_semantic_without_user_idx])
            }
        },
        "timestamp": datetime.now().isoformat()
    }
    
    # 결과를 JSON 파일로 저장
    os.makedirs("test_results", exist_ok=True)
    filename = f"test_results/user_info_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n결과가 {filename}에 저장되었습니다.")

if __name__ == "__main__":
    # 테스트할 사용자 ID
    test_user_pk = 1  # 실제 존재하는 사용자 ID로 변경 필요
    
    # 테스트 실행
    asyncio.run(compare_with_without_user_info(test_user_pk)) 