// 마이크 권한 상태 체크 (Permissions API)
export async function checkMicrophonePermission() {
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const result = await navigator.permissions.query({ name: "microphone" });
      return result.state; // 'granted' | 'denied' | 'prompt'
    } catch {
      return "prompt";
    }
  }
  // Permissions API 미지원 브라우저 fallback
  return "prompt";
}

// 실제 마이크 사용 가능 여부(스트림 얻기 시도)
export async function checkMicrophoneActive() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}
