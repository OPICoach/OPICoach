import { useEffect, useState, useRef } from "react";

const VolumeTest = () => {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream; // 스트림 저장

        microphoneRef.current =
          audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);

        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
          setVolume(Math.min(100, Math.round(average * 1.5)));
          animationFrameId = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    initAudio();

    return () => {
      // 애니메이션 프레임 해제
      cancelAnimationFrame(animationFrameId);
      // 오디오 컨텍스트 종료
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // 마이크 스트림 해제 (사용 중지)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 my-1">
      <div className="w-full flex justify-center items-center py-2">
        <div
          style={{
            width: 200,
            height: 15,
            backgroundColor: "#e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${volume}%`,
              height: "100%",
              backgroundColor: "#3b82f6",
              transition: "width 0.1s ease-in-out",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeTest;
