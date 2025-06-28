
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName, generateColorShades } from '@/lib/color-utils';

type Point = { x: number; y: number };

const ColorPickerView = () => {
  const router = useRouter();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<Point>({ x: 0, y: 0 });
  const [pickedColor, setPickedColor] = useState('#000000');
  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const dataUrl = sessionStorage.getItem('capturedImage');
    if (dataUrl) {
      setImageSrc(dataUrl);
    } else {
      router.push('/camera');
    }
  }, [router]);

  const shades = useMemo(() => generateColorShades(pickedColor, 4), [pickedColor]);
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

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width - 1));
    y = Math.max(0, Math.min(y, rect.height - 1));
    
    setPickerPos({ x, y });
    updateColor(x, y);
  };
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (showHint) {
        setShowHint(false);
    }
    handlePointerMove(e);
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
    const url = `${window.location.origin}/?color=${pickedColor.substring(1)}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Share link copied!', description: 'Send it to a friend.' });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-svh bg-black overflow-hidden cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      {showHint && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm animate-in fade-in duration-500">
            Touch and drag to find your colour.
          </div>
        </div>
      )}
      
      <div
        className="absolute pointer-events-none"
        style={{
          left: pickerPos.x,
          top: pickerPos.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Reticle */}
        <div className="relative w-16 h-16 flex items-center justify-center text-white">
          <div className="w-5 h-5 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm"></div>
          {!isDragging && (
            <>
              <ChevronUp className="absolute -top-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
              <ChevronDown className="absolute -bottom-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
              <ChevronLeft className="absolute -left-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
              <ChevronRight className="absolute -right-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
            </>
          )}
        </div>

        {/* Callout */}
        <div 
          className="absolute bottom-[calc(100%_+_1rem)] left-1/2 -translate-x-1/2 w-max pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="bg-neutral-800/80 backdrop-blur-md rounded-xl shadow-2xl text-white transition-all duration-200 overflow-hidden w-64">
                <div className="flex items-center p-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/20" style={{ backgroundColor: pickedColor }} />
                    <div className="ml-3 flex-grow">
                        <p className="font-bold font-code text-lg tracking-wider">{pickedColor.toUpperCase()}</p>
                        <p className="text-sm text-white/70 uppercase">{getColorName(pickedColor)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white" onClick={() => handleCopy(pickedColor)}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white" onClick={() => setIsPaletteOpen(p => !p)}>
                        <ChevronUp className={cn("w-5 h-5 transition-transform", isPaletteOpen && "rotate-180")} />
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
                                            shade.toLowerCase() === pickedColor.toLowerCase() && "opacity-0"
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
        </div>
      </div>

      <div className={cn(
        "absolute bottom-5 inset-x-0 z-20 flex justify-center transition-opacity duration-300 pointer-events-none",
        isDragging ? "opacity-0" : "opacity-100"
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
