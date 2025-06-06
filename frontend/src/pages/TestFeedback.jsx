import { useEffect, useState } from "react";
import SideBar from "../components/sideBar/SideBar.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { API_BASE_URL } from "../api/api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sideBarState } from "../atom/sidebarAtom.js";
import { useRecoilState } from "recoil";

const TestFeedback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [open, setOpen] = useRecoilState(sideBarState);

  const navigate = useNavigate();

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        setLoading(true);
        const storedFeedbacks = localStorage.getItem("examFeedbacks");

        if (!storedFeedbacks) {
          setError("피드백 데이터를 찾을 수 없습니다.");
          return;
        }

        const parsedFeedbacks = JSON.parse(storedFeedbacks);

        const feedbacksWithAudio = await Promise.all(
          parsedFeedbacks.map(async (feedback) => {
            try {
              const questionAudioPath = `${API_BASE_URL}/exam/audio/audio_files/${feedback.question_audio_path}`;
              const questionResponse = await axios.get(questionAudioPath, {
                responseType: "blob",
              });
              const questionAudioUrl = URL.createObjectURL(
                questionResponse.data
              );

              const answerAudioPath = `${API_BASE_URL}/exam/audio/audio_files/${feedback.user_answer_audio_path}`;
              const answerResponse = await axios.get(answerAudioPath, {
                responseType: "blob",
              });
              const userAnswerAudioUrl = URL.createObjectURL(
                answerResponse.data
              );

              return {
                ...feedback,
                questionAudioUrl,
                userAnswerAudioUrl,
              };
            } catch (error) {
              console.error("Error fetching audio files:", error);
              return {
                ...feedback,
                questionAudioUrl: null,
                userAnswerAudioUrl: null,
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

  if (loading) return <div>Loading Feedbacks...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (feedbacks.length === 0) return <div>피드백 내역이 없습니다.</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-row flex-grow">
        <div
          className={`transition-all duration-300 ${
            open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
          }`}
          style={{ overflow: open ? "visible" : "hidden" }}
        >
          <SideBar />
        </div>
        <div className="max-w-3xl p-4 space-y-6 bg-white border rounded shadow flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Test Result</h2>
          </div>

          {feedbacks.map((item, idx) => {
            const processedMessage =
              item.feedback?.replace(/<br\s*\/?>/g, "\n\n") ||
              "No content available.";

            return (
              <div
                key={idx}
                className="border p-4 rounded shadow-sm bg-gray-50"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Question {idx + 1}
                  </h3>
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
                  <h3 className="text-lg font-semibold mb-2">Your Answer</h3>
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
                  <h3 className="text-lg font-semibold mb-2">
                    Feedback from OPICoach
                  </h3>
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
                            <ul
                              className="list-disc pl-5 space-y-1"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              className="text-base leading-relaxed"
                              {...props}
                            />
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

          {/* 버튼을 피드백 목록 아래 가운데 정렬 */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/test/start")}
              className="w-40 py-2 font-semibold rounded-lg text-white transition duration-300 ease-in-out bg-primary hover:bg-blue-600"
            >
              Test Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFeedback;
