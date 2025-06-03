# db_utils/chroma_db_utils.py
from sentence_transformers import SentenceTransformer
from chromadb import PersistentClient
import os
from dotenv import load_dotenv
import random

load_dotenv()

# Chroma DB 설정
CHROMA_DB_DIR = os.environ.get("CHROMA_DB_PATH", "./chroma_db")
COLLECTION_NAMES = {
    "exam": "exam_docs",
    "information": "information_docs",
    "learning": "learning_docs",
}

# 모델 초기화 (전역으로 관리하거나 필요할 때마다 로드할 수 있습니다.)
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

def get_embedding_model():
    """임베딩 모델을 반환합니다."""
    global embed_model
    return embed_model

def get_chroma_client():
    """ChromaDB 클라이언트를 초기화합니다."""
    return PersistentClient(path=CHROMA_DB_DIR)

def get_collection(client: PersistentClient, collection_name: str):
    """특정 이름의 ChromaDB 컬렉션을 반환합니다."""
    return client.get_collection(name=collection_name)

# 유사 문서 검색 (특정 컬렉션에서)
def retrieve_context(query: str, collection_name: str, top_k: int = 3):
    client = get_chroma_client()
    embed_model = get_embedding_model()
    collection = get_collection(client, collection_name)
    if collection and embed_model:
        results = collection.query(
            query_embeddings=[embed_model.encode([query])[0].tolist()],
            n_results=top_k
        )
        documents = results.get("documents", [[]])[0]
        return "\n\n".join(doc for doc in documents if isinstance(doc, str))
    return ""

# 랜덤 문서 검색 (특정 컬렉션에서)
def retrieve_random_context(collection_name: str, n_results: int = 10):
    client = get_chroma_client()
    collection = get_collection(client, collection_name)
    if collection:
        all_ids = collection.get(include=[])['ids']
        if not all_ids:
            return ""
        random_ids = random.sample(all_ids, min(n_results, len(all_ids)))
        results = collection.get(ids=random_ids, include=["documents"])
        documents = results.get("documents", [[]])
        flat_docs = [doc for sublist in documents for doc in sublist if isinstance(doc, str)]
        return "\n\n".join(flat_docs)
    return ""

# 특정 질문-답변 관련 문서 검색 (특정 컬렉션에서)
def retrieve_related_context(question: str, answer: str, collection_name: str, n_results: int = 10):
    client = get_chroma_client()
    embed_model = get_embedding_model()
    collection = get_collection(client, collection_name)
    if collection and embed_model:
        query_text = f"Question: {question}\nAnswer: {answer}"
        results = collection.query(
            query_embeddings=[embed_model.encode([query_text])[0].tolist()],
            n_results=n_results
        )
        documents = results.get("documents", [[]])[0]
        return "\n\n".join(doc for doc in documents if isinstance(doc, str))
    return ""