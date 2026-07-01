import React, { useEffect, useState } from 'react';
import { useProctoring } from '../hooks/useProctoring';
import { Camera, CameraOff, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProctoringViewProps {
  matchId: string;
  onWarningChange?: (hasWarning: boolean) => void;
}

export const ProctoringView: React.FC<ProctoringViewProps> = ({ matchId, onWarningChange }) => {
  const { videoRef, startCamera, setupProctoring, warningMessage, status, isProctoring } = useProctoring(matchId);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const init = async () => {
      const started = await startCamera();
      if (started) {
        setCameraActive(true);
      }
    };
    init();
  }, [startCamera]);

  useEffect(() => {
    if (onWarningChange) {
      onWarningChange(!!warningMessage);
    }
  }, [warningMessage, onWarningChange]);

  return (
    <div className={`flex flex-col gap-4 relative max-w-sm w-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-2 ${
      warningMessage 
        ? 'border-red-500 shadow-red-500/20' 
        : (isProctoring ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-700')
    }`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-700 ${warningMessage ? 'bg-red-950/40' : 'bg-slate-800'}`}>
        <div className="flex items-center gap-2">
          {warningMessage ? (
            <ShieldAlert className="w-4 h-4 text-red-500" />
          ) : isProctoring ? (
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          ) : (
            <Camera className="w-4 h-4 text-slate-400" />
          )}
          <span className={`text-sm font-semibold ${warningMessage ? 'text-red-200' : 'text-slate-200'}`}>
            {warningMessage ? 'Proctoring Alert' : (isProctoring ? 'Live Proctoring Active' : 'Camera Setup')}
          </span>
        </div>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${warningMessage ? 'bg-red-500 animate-pulse' : (cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500')}`} />
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
            <CameraOff className="w-8 h-8" />
            <span className="text-sm">Camera Offline</span>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover mirror"
          muted 
          playsInline
          style={{ transform: 'scaleX(-1)' }} // Mirror the local video
        />

        {/* Warning Overlay */}
        <AnimatePresence>
          {warningMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/50 backdrop-blur-sm p-3 rounded-lg flex items-start gap-3 shadow-lg"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200 font-medium leading-snug">
                {warningMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {!isProctoring && (
        <div className="p-4 bg-slate-800">
          <button
            onClick={setupProctoring}
            disabled={!cameraActive || status === 'setting_up'}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'setting_up' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {status === 'setting_up' ? 'Initializing...' : 'Confirm Identity & Start'}
          </button>
          <p className="text-xs text-slate-400 text-center mt-3">
            Please ensure your face is clearly visible. This photo will be used to verify your identity throughout the assessment.
          </p>
        </div>
      )}
    </div>
  );
};
