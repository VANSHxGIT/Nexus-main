import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export function useProctoring(matchId: string | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProctoring, setIsProctoring] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'setting_up' | 'active' | 'error'>('idle');

  // Start the webcam feed
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      return true;
    } catch (err) {
      console.error("Camera access denied:", err);
      setWarningMessage("Camera access is required for this assessment.");
      setStatus('error');
      return false;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg').split(',')[1]; // Return base64 without prefix
  }, []);

  // Setup the baseline image for proctoring
  const setupProctoring = useCallback(async () => {
    if (!matchId) return;
    setStatus('setting_up');
    
    const frame = captureFrame();
    if (!frame) return;

    try {
      const response = await fetch(`${API_BASE}/api/interview/${matchId}/setup_proctoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_image_b64: frame })
      });
      
      if (response.ok) {
        setStatus('active');
        setIsProctoring(true);
      }
    } catch (error) {
      console.error("Error setting up proctoring:", error);
      setStatus('error');
    }
  }, [matchId, captureFrame]);

  // Periodic verification
  useEffect(() => {
    if (!isProctoring || !matchId || status !== 'active') return;

    const intervalId = setInterval(async () => {
      const frame = captureFrame();
      if (!frame) return;

      try {
        const response = await fetch(`${API_BASE}/api/interview/${matchId}/verify_face`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_image_b64: frame })
        });

        const data = await response.json();
        if (data.status === 'warning') {
          setWarningMessage(data.message || "Proctoring warning detected.");
        } else {
          setWarningMessage(null); // clear warning if OK
        }
      } catch (error) {
        console.error("Proctoring ping failed:", error);
      }
    }, 10000); // 10 seconds interval

    return () => clearInterval(intervalId);
  }, [isProctoring, matchId, status, captureFrame]);

  return {
    videoRef,
    startCamera,
    setupProctoring,
    warningMessage,
    status,
    isProctoring
  };
}
