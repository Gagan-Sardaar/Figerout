
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName, generateColorShades } from '@/lib/color-utils';

type Point = { x: number; y: number };

const ColorPickerView = () => {
  const router = useRouter();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<Point>({ x: 0, y: 0 });
  const [pickedColor, setPickedColor] = useState('#000000');
  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [calloutStyle, setCalloutStyle] = useState<React.CSSProperties>({});
  const [isAtBoundary, setIsAtBoundary] = useState(false);

  const prevIsAtBoundaryRef = useRef(isAtBoundary);

  useEffect(() => {
    if (isAtBoundary && !prevIsAtBoundaryRef.current) {
      toast({
        title: "Whoa! Almost crossed the line 😅",
        duration: 2000,
      });
    }
    prevIsAtBoundaryRef.current = isAtBoundary;
  }, [isAtBoundary, toast]);


  useEffect(() => {
    const dataUrl = sessionStorage.getItem('capturedImage');
    if (dataUrl) {
      setImageSrc(dataUrl);
    } else {
      router.push('/camera');
    }
  }, [router]);

  const shades = useMemo(() => generateColorShades(pickedColor, 3), [pickedColor]);
  const palette = useMemo(() => [...shades.darker, pickedColor, ...shades.lighter], [shades, pickedColor]);

  const updateColor = useCallback((x: number, y: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    const pixel = context.getImageData(x, y, 1, 1).data;
    const hex = `#${('000000' + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6)}`;
    setPickedColor(hex);
  }, []);

  useEffect(() => {
    if (isPaletteOpen || !calloutRef.current || !containerRef.current) return;
  
    const containerRect = containerRef.current.getBoundingClientRect();
    const calloutWidth = calloutRef.current.offsetWidth;
    const calloutHeight = calloutRef.current.offsetHeight;
  
    const pickerSize = 40; // Approximate size of the picker reticle
    const margin = 48; // 3rem. Was 16, increased to prevent overlap with top arrow
  
    const newStyle: React.CSSProperties = {};
  
    // Vertical Positioning
    const spaceAbove = pickerPos.y;
    if (spaceAbove > calloutHeight + pickerSize + margin) {
      newStyle.top = pickerPos.y - calloutHeight - margin;
    } else {
      newStyle.top = pickerPos.y + pickerSize / 2 + margin;
    }
  
    // Horizontal positioning
    let left = pickerPos.x - calloutWidth / 2;
    if (left < margin) {
      left = margin;
    } else if (left + calloutWidth > containerRect.width - margin) {
      left = containerRect.width - calloutWidth - margin;
    }
    newStyle.left = left;
  
    setCalloutStyle(newStyle);
  
  }, [pickerPos, isPaletteOpen]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const boundaryTop = rect.height * 0.05;
    const boundaryLeft = rect.width * 0.05;
    const boundaryRight = rect.width * 0.95;
    const boundaryBottom = rect.height * 0.80;

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const atBoundary = 
      rawY <= boundaryTop || 
      rawY >= boundaryBottom || 
      rawX <= boundaryLeft || 
      rawX >= boundaryRight;
      
    setIsAtBoundary(atBoundary);
    
    const x = Math.max(boundaryLeft, Math.min(rawX, boundaryRight));
    const y = Math.max(boundaryTop, Math.min(rawY, boundaryBottom));
    
    setPickerPos({ x, y });
    updateColor(x, y);
  };
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (calloutRef.current?.contains(e.target as Node)) {
        return;
    }
    setIsDragging(true);
    if (showHint) {
        setShowHint(false);
    }
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const onImageLoad = (img: HTMLImageElement) => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const containerAspect = container.clientWidth / container.clientHeight;
    const imageAspect = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;
    if (containerAspect > imageAspect) {
      drawWidth = container.clientWidth;
      drawHeight = container.clientWidth / imageAspect;
      offsetX = 0;
      offsetY = (container.clientHeight - drawHeight) / 2;
    } else {
      drawHeight = container.clientHeight;
      drawWidth = container.clientHeight * imageAspect;
      offsetY = 0;
      offsetX = (container.clientWidth - drawWidth) / 2;
    }

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    const initialPos = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    setPickerPos(initialPos);
    updateColor(initialPos.x, initialPos.y);
  };

  useEffect(() => {
    if (imageSrc) {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => onImageLoad(img);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const handleCopy = (color: string) => {
    const text = `${color.toUpperCase()} - ${getColorName(color)}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: text });
  };

  const handleShare = () => {
    const colorName = getColorName(pickedColor);
    const url = `${window.location.origin}/?color=${pickedColor.substring(1)}`;
    const textToCopy = `${colorName}, ${pickedColor.toUpperCase()}\n${url}`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: 'Share info copied!', description: 'Color details and link ready to paste.' });
  };

  const CalloutContent = (
    <div 
        className="bg-neutral-800/80 backdrop-blur-md rounded-xl shadow-2xl text-white transition-all duration-200 overflow-hidden w-64"
        onClick={(e) => {
            if(isPaletteOpen) e.stopPropagation();
        }}
    >
        <div className="flex items-center p-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: pickedColor }} />
            <div className="ml-3 flex-grow">
                <p className="font-bold font-code text-base tracking-wider">{pickedColor.toUpperCase()}</p>
                <p className="text-xs text-white/70 uppercase">{getColorName(pickedColor)}</p>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>
            <Button variant="ghost" className="h-8 px-2 text-white/80 hover:text-white flex items-center gap-1" onClick={() => setIsPaletteOpen(p => !p)}>
                <Palette className="w-4 h-4" />
                {isPaletteOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
        </div>
        
        {isPaletteOpen && (
            <div className="flex flex-col border-t border-white/10">
                {palette.map((shade, index) => (
                    <div
                        key={index}
                        className={cn(
                            "group flex items-center justify-between px-3 py-2 cursor-pointer",
                            "hover:bg-white/10",
                            shade.toLowerCase() === pickedColor.toLowerCase() && "bg-primary/30"
                        )}
                        onClick={() => {
                          setPickedColor(shade);
                        }}
                    >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: shade }}></div>
                          <span className="font-code text-sm font-semibold text-white">{shade.toUpperCase()}</span>
                        </div>
                        
                        <div className="flex items-center">
                            {shade.toLowerCase() === pickedColor.toLowerCase() &&
                                <Check className="w-5 h-5 text-white mr-2" />
                            }
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "w-7 h-7 rounded-md bg-black/20 text-white/80",
                                    "opacity-0 group-hover:opacity-100",
                                )}
                                onClick={(e) => { e.stopPropagation(); handleCopy(shade) }}
                            >
                                <Copy className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-svh bg-black overflow-hidden cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      {showHint && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm animate-in fade-in duration-500">
            Touch and drag to find your colour.
          </div>
        </div>
      )}

      {/* Picker UI */}
      {!isPaletteOpen && (
        <>
          {/* Picker Reticle */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: pickerPos.x,
              top: pickerPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={cn(
                'relative w-16 h-16 flex items-center justify-center transition-colors',
                isAtBoundary ? 'text-red-500' : 'text-white'
              )}
            >
                <div className={cn(
                    "w-5 h-5 rounded-full border-2 border-current bg-current/20 backdrop-blur-sm",
                    isAtBoundary && "animate-pulse"
                )} />
              {!isDragging && !isAtBoundary && (
                <>
                  <ChevronUp
                    className="absolute -top-1 w-6 h-6"
                    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                  />
                  <ChevronDown
                    className="absolute -bottom-1 w-6 h-6"
                    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                  />
                  <ChevronLeft
                    className="absolute -left-1 w-6 h-6"
                    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                  />
                  <ChevronRight
                    className="absolute -right-1 w-6 h-6"
                    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                  />
                </>
              )}
            </div>
          </div>
          {/* Color Callout */}
          <div
              ref={calloutRef}
              className="absolute pointer-events-auto"
              style={calloutStyle}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {CalloutContent}
          </div>
        </>
      )}

      {/* Centered Expanded Palette */}
      {isPaletteOpen && (
        <div 
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsPaletteOpen(false)}
        >
            {CalloutContent}
        </div>
      )}

      {/* Retake Button */}
      <div className={cn(
        "absolute bottom-5 inset-x-0 z-20 flex justify-center transition-opacity duration-300 pointer-events-none",
        isDragging || isPaletteOpen ? "opacity-0" : "opacity-100"
        )}>
         <Button
            onClick={() => router.push('/camera')}
            className="h-20 w-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 active:scale-95 transition-transform pointer-events-auto"
            aria-label="Retake photo"
          >
            <RefreshCw className="h-9 w-9 text-white" />
         </Button>
      </div>

    </div>
  );
};

export default ColorPickerView;
