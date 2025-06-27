"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Zap, ZapOff, SwitchCamera, Circle, X } from 'lucide-react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isDigitalFlashActive, setIsDigitalFlashActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

      // Check for flash capabilities
      const videoTrack = newStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      if ('torch' in capabilities) {
        setHasFlash(true);
        // Auto-enable flash at night
        const hour = new Date().getHours();
        if (hour < 6 || hour > 18) {
          setIsFlashOn(true);
          videoTrack.applyConstraints({ advanced: [{ torch: true }] });
        }
      } else {
        setHasFlash(false);
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
      // Fallback logic
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
    if (!stream || !hasFlash) return;
    const videoTrack = stream.getVideoTracks()[0];
    const newFlashState = !isFlashOn;
    videoTrack.applyConstraints({ advanced: [{ torch: newFlashState }] });
    setIsFlashOn(newFlashState);
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
      // Mirror the image if it's the user-facing camera
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
    if (facingMode === 'user' && !hasFlash && isFlashOn) {
      // Digital flash logic
      let count = 3;
      setCountdown(count);
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      setTimeout(() => {
        setIsDigitalFlashActive(true);
        setTimeout(() => {
          capturePhoto();
          setIsDigitalFlashActive(false);
        }, 200); // Capture after short delay for screen to light up
      }, 3000);
    } else {
      capturePhoto();
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center">
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
          <p className="text-9xl font-bold text-white text-shadow-lg">{countdown}</p>
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


      <div className="absolute bottom-5 inset-x-0 z-10 p-4 flex items-center justify-between">
        <Button onClick={() => router.push('/')} variant="ghost" className="text-white hover:bg-white/10">
          <X className="w-6 h-6 mr-2" /> Cancel
        </Button>
        <Button onClick={handleCapture} className="w-20 h-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 active:scale-95 transition-transform" aria-label="Capture photo">
          <Camera className="w-10 h-10 text-white" />
        </Button>
        <div className="flex flex-col space-y-2">
             <Button onClick={switchCamera} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                <SwitchCamera className="w-6 h-6" />
             </Button>
             {(hasFlash || facingMode === 'user') && (
                <Button onClick={toggleFlash} variant="ghost" size="icon" className={cn("text-white hover:bg-white/10 rounded-full", isFlashOn && "bg-accent/50")}>
                    {isFlashOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </Button>
            )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
