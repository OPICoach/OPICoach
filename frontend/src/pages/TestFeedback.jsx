import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userPkState } from "../atom/authAtoms.js";

const TestFeedback = () => {
  const userPk = useRecoilValue(userPkState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userPk) {
      setError("사용자 정보가 없습니다. 로그인 후 이용해주세요.");
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exam/history?user_pk=${userPk}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (e) {
        setError("피드백 불러오기 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userPk]);

  if (loading) return <div>피드백을 불러오는 중입니다...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (history.length === 0) return <div>피드백 내역이 없습니다.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 bg-white border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">시험 피드백 히스토리</h2>

      {history.map((item, idx) => (
        <div key={idx} className="border p-4 rounded shadow-sm bg-gray-50">
          <div className="mb-2">
            <strong>질문:</strong> {item.question}
          </div>
          <div className="mb-2">
            <strong>유저 답변:</strong> {item.user_answer}
          </div>
          <div className="mb-2 text-green-700">
            <strong>좋은 점:</strong> {item.good_point}
          </div>
          <div className="mb-2 text-red-600">
            <strong>아쉬운 점:</strong> {item.bad_point}
          </div>
          <div className="mb-2 font-semibold">
            <strong>종합 평가:</strong> {item.overall_feedback}
          </div>
          <div className="mb-2 italic">
            <strong>선생님 모범 답변:</strong> {item.teachers_answer}
          </div>
          <div className="text-xs text-gray-400 text-right">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestFeedback;
