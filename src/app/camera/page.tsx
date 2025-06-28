
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Zap, ZapOff, SwitchCamera, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

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

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      router.push('/');
    }, 2 * 60 * 1000); // 2 minutes
  }, [router]);

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

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

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

      const videoTrack = newStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      const hasTorch = 'torch' in capabilities;
      setHasFlash(hasTorch);

      const hour = new Date().getHours();
      const isNight = hour < 6 || hour > 18;
      
      setIsFlashOn(isNight);
      if (hasTorch) {
        videoTrack.applyConstraints({ advanced: [{ torch: isNight }] });
      }

    } catch (err) {
      let message = 'Camera access was denied.';
      if(err instanceof Error && err.name === "NotFoundError") {
        message = `Could not find ${mode} camera.`;
      }
      toast({
        title: 'Camera Error',
        description: message,
        variant: 'destructive',
      });
      if (mode === 'environment') {
        setFacingMode('user');
        getCameraStream('user');
      }
    }
  }, [cleanupStream, toast]);

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
    if (hasFlash && stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.applyConstraints({ advanced: [{ torch: newFlashState }] });
    }
  };
  
  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      if (facingMode === 'user') {
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
    if (facingMode === 'user' && isFlashOn) {
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

  return (
    <div className="relative w-full h-svh bg-black flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
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

      <div className="absolute top-5 inset-x-0 z-10 p-4 flex justify-center">
         <div className="w-full max-w-sm bg-black/30 backdrop-blur-sm rounded-xl p-2">
             <Carousel opts={{ loop: true }}>
                <CarouselContent>
                    <CarouselItem className="text-white text-center text-sm">1. Snap a Photo</CarouselItem>
                    <CarouselItem className="text-white text-center text-sm">2. Drag to Pick</CarouselItem>
                    <CarouselItem className="text-white text-center text-sm">3. Copy the Code</CarouselItem>
                </CarouselContent>
             </Carousel>
         </div>
      </div>


      <div className="absolute bottom-5 inset-x-0 z-10 p-4">
        <div className="flex w-full justify-center items-center gap-x-8">
          <div className="w-12 h-12">
            {(hasFlash || facingMode === 'user') && (
              <Button
                onClick={toggleFlash}
                variant="ghost"
                size="icon"
                className={cn(
                  'w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors',
                  isFlashOn && 'bg-yellow-400 text-black hover:bg-yellow-500'
                )}
                aria-label="Toggle flash"
              >
                {isFlashOn ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />}
              </Button>
            )}
          </div>

          <Button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 active:scale-95 transition-transform"
            aria-label="Capture photo"
          >
            <Camera className="w-9 h-9 text-white" />
          </Button>

          <div className="w-12 h-12">
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              aria-label="Switch camera"
            >
              <SwitchCamera className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
