import React from "react";

const LevelHistory = ({ historyData }) => {
  console.log('LevelHistory received data:', historyData);  // 데이터 확인용 로그

  // 데이터가 없거나 배열이 아닌 경우 처리
  if (!Array.isArray(historyData) || historyData.length === 0) {
    console.log('No history data available');  // 데이터 없음 로그
    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg text-gray-700 font-medium mb-4">Level History</h2>
        <div className="text-gray-500 text-center py-4">No history data available</div>
      </div>
    );
  }

  // 레벨을 수치로 변환하는 함수
  const levelToScore = (level) => {
    const levelMap = {
      "Or below": 0,
      "IL": 100,
      "IM": 200,
      "IH": 300,
      "AL": 400
    };
    return levelMap[level] || 0;
  };

  // 데이터 유효성 검사 및 변환
  const validHistoryData = historyData.map((point, index) => {
    const score = levelToScore(point.level) + (Number(point.progress) || 0);
    console.log(`Point ${index}:`, { level: point.level, progress: point.progress, calculatedScore: score });  // 각 포인트 데이터 로그
    return {
      score,
      label: point.level || '',
      time: point.date || ''
    };
  });

  console.log('Valid history data:', validHistoryData);  // 변환된 데이터 확인

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg text-gray-700 font-medium mb-4">Level History</h2>
      <div className="flex justify-center">
        <div className="w-[70%] aspect-[3/1]">
          <svg viewBox="0 0 700 250" className="w-full h-full">
            {/* 배경 */}
            <rect
              x="70"
              y="25"
              width="580"
              height="200"
              fill="#ffffff"
              rx="4"
            />

            {/* Y축 레벨 레이블 */}
            <g className="text-[10px] font-medium fill-gray-500">
              {["Or below", "IL", "IM", "IH", "AL"].map((level, index) => (
                <g key={level}>
                  <text
                    x="65"
                    y={225 - index * 50}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-[10px]"
                  >
                    {level}
                  </text>
                  <line
                    x1="70"
                    y1={225 - index * 50}
                    x2="650"
                    y2={225 - index * 50}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                </g>
              ))}
            </g>

            {/* X축 날짜 레이블 */}
            <g className="text-[10px] fill-gray-500">
              {validHistoryData.map((point, index) => {
                const x = 70 + (validHistoryData.length === 1 ? 290 : index * (580 / (validHistoryData.length - 1)));
                return (
                  <text
                    key={index}
                    x={x}
                    y="240"
                    textAnchor="middle"
                    className="text-[10px]"
                  >
                    {index + 1}
                  </text>
                );
              })}
            </g>

            {/* 레벨 라인 */}
            <polyline
              points={validHistoryData
                .map((point, index) => {
                  const x = 70 + (validHistoryData.length === 1 ? 290 : index * (580 / (validHistoryData.length - 1)));
                  const y = 225 - (point.score / 400) * 200;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 데이터 포인트 */}
            {validHistoryData.map((point, index) => {
              const x = 70 + (validHistoryData.length === 1 ? 290 : index * (580 / (validHistoryData.length - 1)));
              const y = 225 - (point.score / 400) * 200;
              return (
                <g key={index}>
                  {/* 포인트 배경 */}
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill="white"
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  {/* 포인트 */}
                  <circle
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="#64748b"
                  />
                  {/* 레벨 레이블 */}
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-gray-600"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LevelHistory; 