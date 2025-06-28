
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2, Palette, X, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const shades = useMemo(() => generateColorShades(pickedColor), [pickedColor]);

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

  const handleCopy = () => {
    const text = `${pickedColor.toUpperCase()} - ${getColorName(pickedColor)}`;
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
          <ChevronUp className="absolute -top-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
          <ChevronDown className="absolute -bottom-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
          <ChevronLeft className="absolute -left-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
          <ChevronRight className="absolute -right-1 w-6 h-6" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} />
        </div>

        {/* Callout */}
        <div className="absolute bottom-[calc(100%_+_1rem)] left-1/2 -translate-x-1/2 w-max">
            <div className="bg-black/50 backdrop-blur-md rounded-full shadow-2xl text-white transition-all duration-200">
               {isPaletteOpen ? (
                   <div className="p-2 w-64">
                     <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold">Color Palette</h3>
                       <Button variant="ghost" size="icon" className="w-6 h-6 text-white" onClick={(e) => {e.stopPropagation(); setIsPaletteOpen(false)}}>
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                     <div className="flex justify-center items-center gap-1">
                        {shades.darker.map(s => <div key={s} onClick={(e) => { e.stopPropagation(); setPickedColor(s)}} className="w-7 h-10 rounded cursor-pointer" style={{backgroundColor: s}}/>)}
                        <div className="w-9 h-12 rounded border-2" style={{backgroundColor: pickedColor, borderColor: 'hsl(var(--primary))'}}/>
                        {shades.lighter.map(s => <div key={s} onClick={(e) => { e.stopPropagation(); setPickedColor(s)}} className="w-7 h-10 rounded cursor-pointer" style={{backgroundColor: s}}/>)}
                     </div>
                   </div>
               ) : (
                <div className="flex items-center space-x-2 p-1.5 pl-2">
                    <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: pickedColor }} />
                    <div className="flex-grow pr-2">
                        <p className="font-bold font-code text-sm tracking-wider">{pickedColor.toUpperCase()}</p>
                        <p className="text-xs text-white/70">{getColorName(pickedColor)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white rounded-full" onClick={(e) => {e.stopPropagation(); handleCopy()}}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white rounded-full" onClick={(e) => {e.stopPropagation(); handleShare()}}><Share2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-white/80 hover:text-white rounded-full" onClick={(e) => {e.stopPropagation(); setIsPaletteOpen(true)}}><Palette className="w-4 h-4" /></Button>
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
