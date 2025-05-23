import SideBar from "../components/SideBar.jsx";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import {
  timeLeftState,
  isRunningState,
  isStoppedState,
  audioURLState,
  isRecordingState,
} from "../api/atom.js";

const TestTimer = () => {
  const [timeLeft, setTimeLeft] = useRecoilState(timeLeftState);
  const [isRunning, setIsRunning] = useRecoilState(isRunningState);
  const [isStopped, setIsStopped] = useRecoilState(isStoppedState);
  const [audioURL, setAudioURL] = useRecoilState(audioURLState);
  const [isRecording, setIsRecording] = useRecoilState(isRecordingState);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, setTimeLeft]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("마이크 접근 권한이 필요합니다:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartStopReset = () => {
    if (!isRunning && !isStopped) {
      // Start
      setIsRunning(true);
      setIsStopped(false);
      startRecording();
    } else if (isRunning) {
      // Stop
      setIsRunning(false);
      setIsStopped(true);
      stopRecording();
    } else {
      // Reset
      setTimeLeft(120);
      setIsRunning(false);
      setIsStopped(false);
      setAudioURL(null);
    }
  };

  const getButtonText = () => {
    if (!isRunning && !isStopped) return "Start";
    if (isRunning) return "Stop";
    return "Reset";
  };

  return (
    <div className="flex flex-row">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white">
        <div className="w-[200px] h-[200px] border-4 border-primary rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-8 mt-10">
          <button
            onClick={handleStartStopReset}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            {getButtonText()}
          </button>
          <button
            onClick={handlePlay}
            disabled={!audioURL}
            className={`px-6 py-3 rounded-lg ${
              audioURL
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Play
          </button>
        </div>
        {audioURL && <audio ref={audioRef} src={audioURL} className="hidden" />}
      </div>
    </div>
  );
};

export default TestTimer;
