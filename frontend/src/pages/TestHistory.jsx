import { useEffect, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { userPkState } from "../atom/authAtoms.js";
import { sideBarState } from "../atom/sidebarAtom.js";
import { fetchExamHistory, API_BASE_URL } from "../api/api.js";
import SideBar from "../components/sideBar/SideBar.jsx";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FaPlay } from "react-icons/fa";

const TestHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questionAudios, setQuestionAudios] = useState({});
  const [answerAudios, setAnswerAudios] = useState({});
  const userPk = useRecoilValue(userPkState);
  const [open] = useRecoilState(sideBarState);

  useEffect(() => {
    const loadExamHistory = async () => {
      try {
        setLoading(true);
        const response = await fetchExamHistory(userPk);

        if (!response.history) {
          setError("시험 기록 데이터를 찾을 수 없습니다.");
          return;
        }

        // 각 시험에 ID 추가하고 오디오 파일 가져오기
        const historyWithAudio = await Promise.all(
          response.history.map(async (exam) => {
            const examId =
              exam.question_audio_path.match(/question_1_(\d+)\.mp3/)?.[1] ||
              "0";

            try {
              // 질문 오디오 파일 가져오기
              const questionAudioPath = `${API_BASE_URL}/exam/audio/${exam.question_audio_path}`;
              const questionResponse = await axios.get(questionAudioPath, {
                responseType: "blob",
              });
              const questionAudioUrl = URL.createObjectURL(
                questionResponse.data
              );

              // 답변 오디오 파일 가져오기
              const answerAudioPath = `${API_BASE_URL}/exam/audio/${exam.user_answer_audio_path}`;
              const answerResponse = await axios.get(answerAudioPath, {
                responseType: "blob",
              });
              const userAnswerAudioUrl = URL.createObjectURL(
                answerResponse.data
              );

              return {
                ...exam,
                id: examId,
                questionAudioUrl,
                userAnswerAudioUrl,
              };
            } catch (error) {
              console.error(
                `Error fetching audio files for exam ${examId}:`,
                error
              );
              return {
                ...exam,
                id: examId,
                questionAudioUrl: null,
                userAnswerAudioUrl: null,
              };
            }
          })
        );

        // id 기준으로 정렬 (오름차순)
        historyWithAudio.sort((a, b) => {
          const numA = parseInt(a.id) || 0;
          const numB = parseInt(b.id) || 0;
          return numA - numB;
        });

        // 오디오 URL을 개별 상태에 저장
        const newQuestionAudios = {};
        const newAnswerAudios = {};
        historyWithAudio.forEach((exam) => {
          if (exam.questionAudioUrl) {
            newQuestionAudios[exam.id] = exam.questionAudioUrl;
          }
          if (exam.userAnswerAudioUrl) {
            newAnswerAudios[exam.id] = exam.userAnswerAudioUrl;
          }
        });

        setQuestionAudios(newQuestionAudios);
        setAnswerAudios(newAnswerAudios);
        setExamHistory(historyWithAudio);
        if (historyWithAudio.length > 0) {
          setSelectedExam(historyWithAudio[0]);
        }
      } catch (err) {
        console.error("Error loading test history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExamHistory();
  }, [userPk]);

  // 컴포넌트가 언마운트될 때 URL 객체 해제
  useEffect(() => {
    return () => {
      Object.values(questionAudios).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      Object.values(answerAudios).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [questionAudios, answerAudios]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-row h-screen bg-white">
      <div
        className={`transition-all duration-300 ${
          open ? "w-[230px] min-w-[230px]" : "w-0 min-w-0"
        }`}
        style={{ overflow: open ? "visible" : "hidden" }}
      >
        <SideBar />
      </div>

      <div className="flex flex-col flex-1 px-10 pt-8 pb-8 h-full">
        <h2 className="text-2xl font-semibold mb-6 select-none">
          Test History
        </h2>

        <div className="flex flex-1 overflow-hidden space-x-6">
          {/* 시험 기록 목록 */}
          <div className="w-1/4 border border-gray-200 rounded-lg p-4 overflow-y-auto">
            <ul>
              {loading ? (
                <div className="text-black py-1">Loading...</div>
              ) : examHistory.length === 0 ? (
                <div className="text-black py-1">No tests available.</div>
              ) : (
                examHistory.map((exam, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center mb-2 p-2 rounded-lg cursor-pointer ${
                      selectedExam?.question_audio_path ===
                      exam.question_audio_path
                        ? "bg-blue-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedExam(exam)}
                  >
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Question {index + 1}
                      </h4>

                      <p className="text-gray-600 mb-2">Score: {exam.score}</p>
                      <div className="text-sm text-gray-500">
                        <p className="text-sm text-gray-500">
                          {new Date(exam.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* 선택된 시험 상세 정보 */}
          <div className="flex-1 border border-gray-200 rounded-lg p-4 overflow-y-auto">
            {selectedExam ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-semibold mb-2">Test Details</h4>
                  <h4 className="text-lg font-semibold mb-2">Question</h4>
                  <div className="bg-white p-3 rounded border">
                    <p className="mb-2">{selectedExam.question}</p>
                    {questionAudios[selectedExam.id] && (
                      <div key={`question-audio-${selectedExam.id}`}>
                        <audio
                          controls
                          className="w-full mt-2"
                          onError={(e) => {
                            console.error(
                              `Error playing question audio for exam ${selectedExam.id}:`,
                              e
                            );
                          }}
                        >
                          <source
                            src={questionAudios[selectedExam.id]}
                            type="audio/mpeg"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Your Answer</h4>
                  <div className="bg-white p-3 rounded border">
                    <p className="mb-2">{selectedExam.user_answer}</p>
                    {answerAudios[selectedExam.id] && (
                      <div key={`answer-audio-${selectedExam.id}`}>
                        <audio
                          controls
                          className="w-full mt-2"
                          onError={(e) => {
                            console.error(
                              `Error playing answer audio for exam ${selectedExam.id}:`,
                              e
                            );
                          }}
                        >
                          <source
                            src={answerAudios[selectedExam.id]}
                            type="audio/mpeg"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-semibold mb-2">
                    Feedbacks from OPICoach
                  </h4>
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
                        {selectedExam.feedback?.replace(
                          /<br\s*\/?>/g,
                          "\n\n"
                        ) || "No content available."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Select an exam to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistory;
