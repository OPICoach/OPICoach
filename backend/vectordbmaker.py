import os
from tqdm import tqdm
import chromadb
from sentence_transformers import SentenceTransformer

# 설정
CHROMA_DB_DIR = "./chroma_db"
TIPS_DIR = "./txt_db/tips"
FEEDBACKS_DIR = "./txt_db/feedbacks"
TIPS_COLLECTION_NAME = "tips_docs"
FEEDBACKS_COLLECTION_NAME = "feedbacks_docs"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# 임베딩 모델 로딩
print("임베딩 모델 로딩 중...")
embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
print("임베딩 모델 로딩 완료.")

# Chroma DB 클라이언트 생성
print("Chroma DB 초기화 중...")
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# 기존 컬렉션 삭제 (덮어쓰기 위해)
for collection_name in [TIPS_COLLECTION_NAME, FEEDBACKS_COLLECTION_NAME]:
    if collection_name in [c.name for c in chroma_client.list_collections()]:
        chroma_client.delete_collection(name=collection_name)
        print(f"기존 컬렉션 '{collection_name}' 삭제 완료.")

# 새로 컬렉션 생성
tips_collection = chroma_client.get_or_create_collection(name=TIPS_COLLECTION_NAME)
feedbacks_collection = chroma_client.get_or_create_collection(name=FEEDBACKS_COLLECTION_NAME)
print(f"DB '{TIPS_COLLECTION_NAME}' 및 '{FEEDBACKS_COLLECTION_NAME}' 로딩 완료.\n")

# 텍스트 임베딩 및 저장
def load_and_store_txt(folder_path, collection):
    txt_files = sorted([f for f in os.listdir(folder_path) if f.endswith(".txt")])
    print(f"총 {len(txt_files)}개의 텍스트 파일 처리 시작.\n")
    for idx, fname in enumerate(tqdm(txt_files, desc="임베딩 및 저장 진행 중")):
        with open(os.path.join(folder_path, fname), 'r', encoding='utf-8') as f:
            text = f.read()
            embedding = embed_model.encode([text]).tolist()
            doc_id = str(idx + 1)  # id는 숫자로 매겨서 통일
            metadata = {"source": fname}
            collection.add(documents=[text], metadatas=[metadata], embeddings=embedding, ids=[doc_id])

if __name__ == "__main__":
    # 각각의 폴더에 대해 텍스트 임베딩 및 저장
    print("TIPS 컬렉션 처리 중...")
    load_and_store_txt(TIPS_DIR, tips_collection)

    print("\nFEEDBACKS 컬렉션 처리 중...")
    load_and_store_txt(FEEDBACKS_DIR, feedbacks_collection)

    # 저장 완료 후 문서 개수 출력
    tips_document_count = tips_collection.count()
    feedbacks_document_count = feedbacks_collection.count()

    print(f"\nTIPS 컬렉션에 총 {tips_document_count}개의 문서가 저장되었습니다.")
    print(f"FEEDBACKS 컬렉션에 총 {feedbacks_document_count}개의 문서가 저장되었습니다.")
