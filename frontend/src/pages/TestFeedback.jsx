import { useEffect, useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { API_BASE_URL } from "../api/api.js";
import axios from "axios";

const TestFeedback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        setLoading(true);
        // localStorage에서 데이터 로드
        const storedFeedbacks = localStorage.getItem('examFeedbacks');

        if (!storedFeedbacks) {
          setError("피드백 데이터를 찾을 수 없습니다.");
          return;
        }

        const parsedFeedbacks = JSON.parse(storedFeedbacks);
        
        // 각 피드백에 대해 오디오 파일 가져오기
        const feedbacksWithAudio = await Promise.all(
          parsedFeedbacks.map(async (feedback) => {
            try {
              // 질문 오디오 파일 가져오기
              const questionAudioPath = `${API_BASE_URL}/exam/audio/audio_files/${feedback.question_audio_path}`;
              const questionResponse = await axios.get(
                questionAudioPath,
                { responseType: 'blob' }
              );
              const questionAudioUrl = URL.createObjectURL(questionResponse.data);

              // 답변 오디오 파일 가져오기
              const answerAudioPath = `${API_BASE_URL}/exam/audio/audio_files/${feedback.user_answer_audio_path}`;
              const answerResponse = await axios.get(
                answerAudioPath,
                { responseType: 'blob' }
              );
              const userAnswerAudioUrl = URL.createObjectURL(answerResponse.data);

              return {
                ...feedback,
                questionAudioUrl,
                userAnswerAudioUrl
              };
            } catch (error) {
              console.error('Error fetching audio files:', error);
              return {
                ...feedback,
                questionAudioUrl: null,
                userAnswerAudioUrl: null
              };
            }
          })
        );

        setFeedbacks(feedbacksWithAudio);
      } catch (e) {
        setError("피드백 데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackData();
  }, []);

  if (loading) return <div>피드백을 불러오는 중입니다...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (feedbacks.length === 0) return <div>피드백 내역이 없습니다.</div>;

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="max-w-3xl mx-auto p-4 space-y-6 bg-white border rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">시험 결과</h2>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</option>
          </select>
        </div>

        {feedbacks.map((item, idx) => {
          const processedMessage = item.feedback?.replace(/<br\s*\/?>/g, "\n\n") || "No content available.";
          
          return (
            <div key={idx} className="border p-4 rounded shadow-sm bg-gray-50">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">질문 {idx + 1}</h3>
                <div className="bg-white p-3 rounded border">
                  <p className="mb-2">{item.question}</p>
                  {item.questionAudioUrl && (
                    <audio 
                      controls 
                      className="w-full mt-2"
                      src={item.questionAudioUrl}
                    />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">내 답변</h3>
                <div className="bg-white p-3 rounded border">
                  <p className="mb-2 text-gray-700">{item.userAnswer}</p>
                  {item.userAnswerAudioUrl && (
                    <audio 
                      controls 
                      className="w-full mt-2"
                      src={item.userAnswerAudioUrl}
                    />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">피드백</h3>
                <div className="bg-white p-3 rounded border">
                  <div className="prose">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="text-black" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h3 className="text-xl font-semibold" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-semibold" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-5 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="text-base leading-relaxed" {...props} />
                        ),
                      }}
                    >
                      {processedMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestFeedback;
