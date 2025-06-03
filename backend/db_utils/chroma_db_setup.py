# db_utils/chroma_db_setup.py
import chromadb
import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

# 설정
CHROMA_DB_DIR = "./chroma_db"
TXT_DB_DIR = "./txt_db"
COLLECTION_NAMES = {
    "exam": "exam_docs",
    "information": "information_docs",
    "learning": "learning_docs",
}
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Chroma DB 클라이언트 생성 함수
def get_chroma_client():
    return chromadb.PersistentClient(path=CHROMA_DB_DIR)

# 임베딩 모델 로드 함수
def get_embedding_model():
    return SentenceTransformer(EMBEDDING_MODEL_NAME)

# 기존 컬렉션 삭제 (덮어쓰기 위해)
def delete_existing_collections(client: chromadb.PersistentClient):
    for collection_name in COLLECTION_NAMES.values():
        if collection_name in [c.name for c in client.list_collections()]:
            client.delete_collection(name=collection_name)
            print(f"기존 컬렉션 '{collection_name}' 삭제 완료.")

# 텍스트 임베딩 및 저장 함수
def load_and_store_txt_from_folder(client: chromadb.PersistentClient, folder_name: str, collection_name: str):
    folder_path = os.path.join(TXT_DB_DIR, folder_name)
    collection = client.get_collection(name=collection_name)
    embed_model = get_embedding_model()
    if os.path.exists(folder_path) and collection and embed_model:
        txt_files = sorted([f for f in os.listdir(folder_path) if f.endswith(".txt")])
        print(f"총 {len(txt_files)}개의 텍스트 파일 처리 시작 ({folder_name}).\n")
        for idx, fname in enumerate(tqdm(txt_files, desc=f"임베딩 및 저장 진행 중 ({folder_name})")):
            with open(os.path.join(folder_path, fname), 'r', encoding='utf-8') as f:
                text = f.read()
                embedding = embed_model.encode([text]).tolist()
                doc_id = str(idx + 1)   # id는 숫자로 매겨서 통일
                metadata = {"source": fname}
                collection.add(documents=[text], metadatas=[metadata], embeddings=embedding, ids=[doc_id])
        print(f"{collection.count()}개의 문서가 '{collection.name}' 컬렉션에 저장 완료 ({folder_name}).\n")
    else:
        print(f"폴더 '{folder_path}'가 존재하지 않거나 컬렉션을 찾을 수 없습니다.")

if __name__ == "__main__":
    # ChromaDB 클라이언트 생성
    client = get_chroma_client()

    # 기존 컬렉션 삭제
    delete_existing_collections(client)

    # 컬렉션 생성 및 데이터 로드
    print("\nChroma DB 데이터 로딩 시작...\n")
    for folder_name, collection_name in COLLECTION_NAMES.items():
        # 먼저 컬렉션 생성 (get_or_create 사용)
        client.get_or_create_collection(name=collection_name)
        # 그 후 데이터 로드
        load_and_store_txt_from_folder(client, folder_name, collection_name)

    print("\nChroma DB 데이터 로딩 및 저장 완료 (setup에서 실행).")