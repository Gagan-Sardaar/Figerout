
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Zap, ZapOff, SwitchCamera, Circle, Sun, Moon, MousePointer2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CameraView = () => {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isDigitalFlashActive, setIsDigitalFlashActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const isMobile = useIsMobile();
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  const instructions = [
    { icon: Camera, title: 'Snap a Photo', subtitle: 'Use the camera to capture inspiration.' },
    { icon: MousePointer2, title: 'Drag to Pick', subtitle: 'Move the picker to select a color.' },
    { icon: Copy, title: 'Copy the Code', subtitle: 'Your hex code is ready to share.' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
        setInstructionIndex(prev => (prev + 1) % instructions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [instructions.length]);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      cleanupStream();
      router.push('/');
    }, 2 * 60 * 1000); // 2 minutes
  }, [router, cleanupStream]);

  useEffect(() => {
    resetIdleTimer();
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'touchstart', 'keydown'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, [resetIdleTimer]);

  const getCameraStream = useCallback(async (mode: 'environment' | 'user') => {
    cleanupStream();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setStream(newStream);
      setHasCameraPermission(true);

      const videoTrack = newStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      // Check for torch capability
      const hasTorch = 'torch' in capabilities;
      setHasFlash(hasTorch);
      
      // Ensure flash is off by default, removing automatic activation.
      setIsFlashOn(false);

    } catch (err) {
      setHasCameraPermission(false);
      let message = 'Camera access was denied.';
      if(err instanceof Error && err.name === "NotFoundError") {
        message = `Could not find ${mode} camera.`;
      }
      toast({
        title: 'Camera Error',
        description: message,
        variant: 'destructive',
      });
      if (isMobile && mode === 'environment') {
        setFacingMode('user');
      }
    }
  }, [cleanupStream, toast, isMobile]);

  useEffect(() => {
    getCameraStream(facingMode);
    return () => {
      cleanupStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleFlash = () => {
    const newFlashState = !isFlashOn;
    setIsFlashOn(newFlashState);
    
    // Only apply physical torch for back camera.
    if (hasFlash && stream && facingMode === 'environment') {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.applyConstraints({ advanced: [{ torch: newFlashState }] });
    }
  };
  
  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Turn off physical flash if it's on before navigating away.
    if (stream && hasFlash && isFlashOn && facingMode === 'environment') {
      const videoTrack = stream.getVideoTracks()[0];
      try {
        videoTrack.applyConstraints({ advanced: [{ torch: false }] });
      } catch (e) {
        console.error("Failed to turn off torch", e);
      }
      setIsFlashOn(false);
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      if (facingMode === 'user' || !isMobile) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      sessionStorage.setItem('capturedImage', dataUrl);
      router.push('/picker');
    }
  };

  const handleCapture = () => {
    if (!hasCameraPermission) {
      toast({
        title: 'Camera Permission Required',
        description: 'Please grant camera access in your browser settings to take a photo.',
        variant: 'destructive',
      });
      return;
    }
    if (isMobile && facingMode === 'user' && isFlashOn) {
      let count = 3;
      setCountdown(count);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      setTimeout(() => {
        clearInterval(countdownInterval);
        setIsDigitalFlashActive(true);
        setTimeout(() => {
          capturePhoto();
          setIsDigitalFlashActive(false);
          setCountdown(0);
        }, 200);
      }, 3000);
    } else {
      capturePhoto();
    }
  };
  
  const currentInstruction = instructions[instructionIndex];
  const Icon = currentInstruction.icon;

  return (
    <div className="relative w-full h-svh bg-black flex flex-col items-center justify-center overflow-hidden" style={{ touchAction: 'none' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={cn(
          "absolute top-0 left-0 w-full h-full object-cover",
          (facingMode === 'user' || !isMobile) && "scale-x-[-1]"
        )}
      />
       <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
        <Circle className="w-16 h-16 text-white/50" />
      </div>
      
      {isDigitalFlashActive && <div className="absolute inset-0 bg-white z-30" />}
      
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <p className="text-9xl font-bold text-white" style={{textShadow: '0 0 15px rgba(0,0,0,0.5)'}}>{countdown}</p>
        </div>
      )}

      {!hasCameraPermission && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Alert variant="destructive" className="max-w-md">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                    Figerout needs access to your camera to work. Please enable camera permissions in your browser settings and refresh the page.
                </AlertDescription>
            </Alert>
        </div>
      )}

      <div className={cn("absolute top-[10%] left-1/2 -translate-x-1/2 z-10", !hasCameraPermission && "hidden")}>
        <div key={instructionIndex} className="relative bg-black/40 backdrop-blur-md rounded-full animate-in fade-in duration-500 overflow-hidden">
            <div className="flex w-max items-center gap-3 px-4 py-2 text-white">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-bold text-sm">{currentInstruction.title}</p>
                    <p className="text-xs text-white/70">{currentInstruction.subtitle}</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
                <div 
                    className="h-full bg-white animate-progress"
                ></div>
            </div>
        </div>
      </div>

      <div className={cn("absolute bottom-5 inset-x-0 z-10 p-4", !hasCameraPermission && "hidden")}>
        <div className="relative flex h-20 w-full items-center justify-center">
          {/* Flash Button */}
          <div className="absolute left-[20%] -translate-x-1/2">
            {isMobile && (hasFlash || facingMode === 'user') && (
              <Button
                onClick={toggleFlash}
                variant="ghost"
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors',
                  isFlashOn && 'bg-yellow-400 text-black hover:bg-yellow-500'
                )}
                aria-label="Toggle flash"
              >
                {facingMode === 'user' ? (
                  isFlashOn ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />
                ) : (
                  isFlashOn ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />
                )}
              </Button>
            )}
          </div>

          {/* Capture Button */}
          <Button
            onClick={handleCapture}
            className="h-20 w-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 active:scale-95 transition-transform"
            aria-label="Capture photo"
          >
            <Camera className="h-9 w-9 text-white" />
          </Button>

          {/* Switch Camera Button */}
          <div className="absolute right-[20%] translate-x-1/2">
            {isMobile && (
              <Button
                onClick={switchCamera}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                aria-label="Switch camera"
              >
                <SwitchCamera className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
