import asyncio
import json
import os
from datetime import datetime
from db_utils.chroma_db_utils import retrieve_context
from learning_mode import load_prompt_template, ask_llm

async def generate_tips_without_rag():
    """RAG를 사용하지 않고 OPIC 시험 팁 생성"""
    # 학습 모드 프롬프트 템플릿 로드
    prompt_template = await load_prompt_template("prompt/prompt_learning.txt")
    prompt = prompt_template.format(
        user_info="",
        context="",
        question="오픽 시험에서 중요한 스킬 3가지만 주세요."
    )
    
    # 새로운 대화 시작을 위해 system 메시지 추가
    system_message = "You are a helpful assistant that provides tips for the OPIC exam. Please provide a fresh response without referring to any previous conversation."
    tips = await ask_llm(system_message, "", "", prompt, model_name="gemini-2.0-flash")
    return tips

async def generate_tips_with_rag():
    """RAG를 사용하여 OPIC 시험 팁 생성"""
    # 관련 문서 검색
    context_text = retrieve_context("오픽 시험에서 중요한 스킬 3가지만 주세요.", "exam_docs", top_k=3)
    
    # 학습 모드 프롬프트 템플릿 로드
    prompt_template = await load_prompt_template("prompt/prompt_learning.txt")
    prompt = prompt_template.format(
        user_info="",
        context=context_text,
        question="오픽 시험에서 중요한 스킬 3가지만 주세요."
    )
    
    # 새로운 대화 시작을 위해 system 메시지 추가
    system_message = "You are a helpful assistant that provides tips for the OPIC exam. Please provide a fresh response based on the given context without referring to any previous conversation."
    tips = await ask_llm(system_message, "", "", prompt, model_name="gemini-2.0-flash")
    return tips

async def compare_rag_vs_non_rag(num_trials: int = 1):
    """RAG 사용 여부에 따른 OPIC 시험 팁 생성 결과 비교"""
    results = {
        "rag_results": [],
        "non_rag_results": [],
        "timestamp": datetime.now().isoformat()
    }
    
    # HTML 템플릿
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OPIC 시험 팁 비교 결과</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
            .section {{ margin-bottom: 40px; }}
            .section-title {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
            .tips {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; }}
            .tips h3 {{ color: #2980b9; }}
            .tips ul {{ list-style-type: none; padding-left: 0; }}
            .tips li {{ margin: 10px 0; padding-left: 20px; position: relative; }}
            .tips li:before {{ content: "•"; position: absolute; left: 0; color: #3498db; }}
            .timestamp {{ color: #7f8c8d; font-size: 0.9em; margin-top: 40px; }}
        </style>
    </head>
    <body>
        <h1>OPIC 시험 팁 비교 결과</h1>
        <div class="timestamp">생성 시간: {timestamp}</div>
        
        <div class="section">
            <h2 class="section-title">RAG를 사용하지 않은 팁</h2>
            {non_rag_content}
        </div>
        
        <div class="section">
            <h2 class="section-title">RAG를 사용한 팁</h2>
            {rag_content}
        </div>
    </body>
    </html>
    """
    
    # RAG를 사용하지 않은 팁 생성
    non_rag_content = ""
    for i in range(num_trials):
        tips = await generate_tips_without_rag()
        # HTML 태그 제거 및 정리
        clean_tips = tips.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
        clean_tips = clean_tips.replace('*', '•').replace('**', '')
        # 연속된 bullet point 제거
        clean_tips = clean_tips.replace('••', '')
        results["non_rag_results"].append(clean_tips)
        non_rag_content += f'<div class="tips"><h3>시도 {i+1}/{num_trials}</h3>{clean_tips}</div>'
    
    # RAG를 사용한 팁 생성
    rag_content = ""
    for i in range(num_trials):
        tips = await generate_tips_with_rag()
        # HTML 태그 제거 및 정리
        clean_tips = tips.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
        clean_tips = clean_tips.replace('*', '•').replace('**', '')
        # 연속된 bullet point 제거
        clean_tips = clean_tips.replace('••', '')
        results["rag_results"].append(clean_tips)
        rag_content += f'<div class="tips"><h3>시도 {i+1}/{num_trials}</h3>{clean_tips}</div>'
    
    # HTML 파일로 저장
    os.makedirs("test_results", exist_ok=True)
    html_filename = f"test_results/opic_tips_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    with open(html_filename, "w", encoding="utf-8") as f:
        f.write(html_template.format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            non_rag_content=non_rag_content,
            rag_content=rag_content
        ))
    
    # JSON 파일로도 저장
    json_filename = f"test_results/opic_tips_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n결과가 다음 파일들에 저장되었습니다:")
    print(f"HTML 보고서: {html_filename}")
    print(f"JSON 데이터: {json_filename}")

if __name__ == "__main__":
    # 테스트 실행
    asyncio.run(compare_rag_vs_non_rag()) 