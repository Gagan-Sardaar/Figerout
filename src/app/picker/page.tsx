
"use client";

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check, Palette, Save, Loader2, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName, generateColorShades, isColorLight } from '@/lib/color-utils';
import { generateColorHistory } from '@/ai/flows/generate-color-history';

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
  const [isAtBoundary, setIsAtBoundary] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [calloutStyle, setCalloutStyle] = useState<React.CSSProperties>({
    opacity: 0,
    position: 'absolute',
    pointerEvents: 'none',
  });
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [colorHistory, setColorHistory] = useState('');
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const isPickedColorLight = React.useMemo(() => {
    if (!pickedColor) return false;
    return isColorLight(pickedColor);
  }, [pickedColor]);

  useEffect(() => {
    const dataUrl = sessionStorage.getItem('capturedImage');
    if (dataUrl) {
      setImageSrc(dataUrl);
    } else {
      router.push('/choose');
    }
    const user = localStorage.getItem('loggedInUser');
    setIsUserLoggedIn(!!user);
  }, [router]);

  const shades = React.useMemo(() => generateColorShades(pickedColor, 3), [pickedColor]);
  const palette = React.useMemo(() => [...shades.darker, pickedColor, ...shades.lighter], [shades, pickedColor]);

  const updateColor = useCallback((x: number, y: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    const pixel = context.getImageData(x, y, 1, 1).data;
    const hex = `#${('000000' + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6)}`;
    setPickedColor(hex);
  }, []);
  
  useLayoutEffect(() => {
    if (isPaletteOpen || !containerRef.current || !calloutRef.current) {
        setCalloutStyle((prev) => ({...prev, opacity: 0}));
        return;
    };

    const containerRect = containerRef.current.getBoundingClientRect();
    const calloutWidth = calloutRef.current.offsetWidth;
    const calloutHeight = calloutRef.current.offsetHeight;

    if (calloutWidth === 0 || calloutHeight === 0) {
      setCalloutStyle((prev) => ({...prev, opacity: 0}));
      return;
    }

    const pickerSize = 40;
    const verticalMargin = 32;
    const horizontalMargin = 16;
    
    let top, left;

    const spaceAbove = pickerPos.y - (pickerSize / 2);
    if (spaceAbove > calloutHeight + verticalMargin) {
        top = pickerPos.y - calloutHeight - verticalMargin;
    } else {
        top = pickerPos.y + pickerSize / 2 + 16;
    }
    
    left = pickerPos.x - calloutWidth / 2;
    if (left < horizontalMargin) {
      left = horizontalMargin;
    } else if (left + calloutWidth > containerRect.width - horizontalMargin) {
      left = containerRect.width - calloutWidth - horizontalMargin;
    }
    
    setCalloutStyle({ 
      position: 'absolute', 
      pointerEvents: 'auto', 
      willChange: 'top, left',
      top: `${top}px`,
      left: `${left}px`,
      opacity: 1,
    });
  }, [pickerPos, isPaletteOpen, isAtBoundary]);

  const updatePickerPosition = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
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
  }, [updateColor]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isHistoryModalOpen || isPaletteOpen || calloutRef.current?.contains(e.target as Node)) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);

    if (showHint) {
      setShowHint(false);
    }
    
    const handlePointerMove = (event: PointerEvent) => {
      updatePickerPosition(event);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    updatePickerPosition(e.nativeEvent);
  }, [isPaletteOpen, showHint, updatePickerPosition, isHistoryModalOpen]);

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
    setIsPaletteOpen(false);
  };

  useEffect(() => {
    if (imageSrc) {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => onImageLoad(img);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const handleSaveRedirect = () => {
    const colorToSave = {
      hex: pickedColor.toUpperCase(),
      name: getColorName(pickedColor),
    };
    sessionStorage.setItem('colorToSaveAfterLogin', JSON.stringify(colorToSave));
    router.push('/login');
  };

  const handleSave = () => {
    if (isUserLoggedIn) {
      const colorName = getColorName(pickedColor);
      try {
        const storedColorsRaw = localStorage.getItem('savedColors');
        const savedColors = storedColorsRaw ? JSON.parse(storedColorsRaw) : [];
        const newColor = {
          hex: pickedColor.toUpperCase(),
          name: colorName,
          sharedAt: new Date().toISOString()
        };
        if (!savedColors.some((c: { hex: string; }) => c.hex === newColor.hex)) {
           const updatedColors = [newColor, ...savedColors];
           localStorage.setItem('savedColors', JSON.stringify(updatedColors));
           toast({
              title: 'Color Saved!',
              description: `${colorName} has been saved to your dashboard.`,
           });
        } else {
           toast({
              title: 'Color Already Saved',
              description: `${colorName} is already in your collection.`,
           });
        }
      } catch (e) {
        console.error("Could not save color to localStorage", e);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not save the color.',
        });
      }
    } else {
      handleSaveRedirect();
    }
  };

  const handleCopy = () => {
    const textToCopy = pickedColor.toUpperCase();
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Color Copied!',
        description: `${getColorName(pickedColor)} (${pickedColor.toUpperCase()}) copied to clipboard.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
      });
    });
  };

  const handleShare = async () => {
    const colorName = getColorName(pickedColor);
    const url = `${window.location.origin}/?color=${pickedColor.substring(1)}`;
    const textToCopy = `${colorName}, ${pickedColor.toUpperCase()}\n${url}`;

    if (isUserLoggedIn) {
      try {
        const storedColorsRaw = localStorage.getItem('savedColors');
        const savedColors = storedColorsRaw ? JSON.parse(storedColorsRaw) : [];
        const newColor = {
          hex: pickedColor.toUpperCase(),
          name: colorName,
          sharedAt: new Date().toISOString(),
        };
        if (!savedColors.some((c: {hex: string}) => c.hex === newColor.hex)) {
          const updatedColors = [newColor, ...savedColors];
          localStorage.setItem('savedColors', JSON.stringify(updatedColors));
        }
      } catch (e) {
        console.error('Could not save color to localStorage', e);
      }
    }

    navigator.clipboard.writeText(textToCopy).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
      });
    });

    setShowShareConfirmation(true);

    setIsFetchingHistory(true);
    setColorHistory('');
    generateColorHistory({colorHex: pickedColor, colorName})
      .then(result => {
        setColorHistory(result.history);
      })
      .catch(error => {
        console.error('Error generating color history:', error);
        setColorHistory('A truly unique color with a story yet to be written.');
      })
      .finally(() => {
        setIsFetchingHistory(false);
      });

    setTimeout(() => {
      setShowShareConfirmation(false);
      setIsHistoryModalOpen(true);
    }, 5000);
  };

  const CalloutContent = (
    <div 
        className="bg-neutral-800/80 backdrop-blur-md rounded-xl shadow-2xl text-white transition-all duration-200 overflow-hidden"
    >
        <div className="flex items-center p-3 gap-2">
            <button 
              onClick={() => setIsPaletteOpen(true)}
              className="relative w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800"
              style={{ backgroundColor: pickedColor }}
              aria-label="Open color palette"
            >
              <Palette className="w-4 h-4 text-white opacity-75" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}/>
            </button>
            <div className="flex-grow">
                <p className="font-bold font-code text-base tracking-wider">{pickedColor.toUpperCase()}</p>
                <p className="text-xs text-white/70 uppercase">{getColorName(pickedColor)}</p>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" className="h-8 px-3 text-white/80 hover:text-white flex items-center gap-1.5" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs">Share</span>
                </Button>
            </div>
        </div>
    </div>
  );

  const BoundaryAlertMessage = (
    <div
      className="bg-white text-black rounded-xl shadow-2xl text-center font-sans p-3 max-w-40"
      onClick={(e) => e.stopPropagation()}
    >
      Whoa! Almost crossed the line 😅
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-svh bg-black overflow-hidden cursor-crosshair"
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      {showHint && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm animate-in fade-in duration-500 max-w-xs sm:max-w-none">
            <span className="text-right">Touch and drag</span>
            <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full border border-current bg-current/20" />
                <ChevronUp className="absolute -top-1 w-3 h-3" />
                <ChevronDown className="absolute -bottom-1 w-3 h-3" />
                <ChevronLeft className="absolute -left-1 w-3 h-3" />
                <ChevronRight className="absolute -right-1 w-3 h-3" />
            </div>
            <span className="text-left">to find your colour.</span>
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
                {!isAtBoundary && (
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
            
            {/* Color Callout or Boundary Alert */}
            <div
                ref={calloutRef}
                style={calloutStyle}
                onPointerDown={(e) => e.stopPropagation()}
            >
                {isAtBoundary ? BoundaryAlertMessage : CalloutContent}
            </div>
        </>
      )}
      
      {/* Centered Palette Modal */}
      {isPaletteOpen && (
        <div 
          className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsPaletteOpen(false)}
        >
          <div 
            className="bg-neutral-800 rounded-xl shadow-2xl text-white w-full max-w-xs animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0 mt-px" style={{ backgroundColor: pickedColor }} />
                    <div className="flex-grow">
                        <p className="font-bold font-code text-sm tracking-wider">{pickedColor.toUpperCase()}</p>
                        <p className="text-xs text-white/70 uppercase">{getColorName(pickedColor)}</p>
                        <p className="text-xs text-white/70 pt-1">Choose your perfect color shade</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col max-h-[50vh] overflow-y-auto">
                {palette.map((shade, index) => (
                    <div
                        key={index}
                        className={cn(
                            "group flex items-center justify-between px-4 py-2 cursor-pointer transition-colors",
                            "hover:bg-white/10",
                            shade.toLowerCase() === pickedColor.toLowerCase() && "bg-primary/30"
                        )}
                        onClick={() => {
                          setPickedColor(shade);
                          setIsPaletteOpen(false);
                        }}
                    >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: shade }}></div>
                          <span className="font-code text-sm font-semibold text-white">{shade.toUpperCase()}</span>
                        </div>
                        
                        <div className="flex items-center">
                            {shade.toLowerCase() === pickedColor.toLowerCase() &&
                                <Check className="w-5 h-5 text-white" />
                            }
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Confirmation Modal */}
      {showShareConfirmation && (
        <div 
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-zinc-800 rounded-xl shadow-2xl text-white w-full max-w-sm p-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Colour Ready to Share</h2>
              <p className="text-white/70 mt-2 mb-8">
                Boom! ‘{getColorName(pickedColor)} – {pickedColor.toUpperCase()}’ is copied. Share the vibe with your friends!
              </p>
              <div className="relative w-full h-10">
                  <div className="absolute inset-0 h-full bg-white/10 rounded-full overflow-hidden">
                      <div className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-primary/50 via-primary to-accent animate-indeterminate-progress"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center px-4 py-2">
                      <p className="text-xs font-semibold text-white/90 truncate px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          Fetching your color's history...
                      </p>
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div 
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="bg-zinc-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
             <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className={cn(
                    "absolute top-4 left-4 h-8 w-8 rounded-full z-10 transition-colors",
                    isPickedColorLight 
                        ? "bg-black/10 text-black/70 hover:bg-black/20 hover:text-black" 
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                )}
                aria-label="Save color"
            >
                <Save className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHistoryModalOpen(false)}
                className={cn(
                    "absolute top-4 right-4 h-8 w-8 rounded-full z-10 transition-colors",
                    isPickedColorLight
                        ? "bg-black/10 text-black/70 hover:bg-black/20 hover:text-black"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                )}
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </Button>
            
            <div className="relative h-48 w-full" style={{ backgroundColor: pickedColor }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <p className={cn(
                    "font-mono text-4xl font-bold tracking-widest",
                    isPickedColorLight ? "text-zinc-900" : "text-white"
                   )} style={{ textShadow: isPickedColorLight ? '0 1px 1px rgba(255,255,255,0.7)' : '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {pickedColor.toUpperCase()}
                </p>
                <p className={cn(
                    "text-lg uppercase",
                    isPickedColorLight ? "text-zinc-900/80" : "text-white/80"
                   )} style={{ textShadow: isPickedColorLight ? '0 1px 1px rgba(255,255,255,0.7)' : '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {getColorName(pickedColor)}
                </p>
              </div>
            </div>
            <div className="p-8 text-center bg-zinc-800 text-white">
              <h2 className="text-2xl font-bold tracking-tight">Color Time-Machine</h2>
              <div className="h-12 mt-4 flex items-center justify-center">
                {isFetchingHistory ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <p className="text-sm text-white/70 italic">
                    "{colorHistory}"
                  </p>
                )}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                 <Button onClick={handleCopy} size="lg" className="w-full rounded-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
                      <Copy className="mr-2 h-5 w-5" />
                      Copy Color
                  </Button>
                  <Button onClick={() => router.push('/choose')} variant="outline" size="lg" className="w-full rounded-full h-12 font-semibold border-white/30 text-white/80 hover:bg-white/10 hover:text-white">
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Retake
                  </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Retake Button */}
      <div className={cn(
        "absolute bottom-5 inset-x-0 z-20 flex justify-center transition-opacity duration-300 pointer-events-none",
        (isDragging && !isAtBoundary) || isPaletteOpen ? "opacity-0" : "opacity-100"
        )}>
         <Button
            onClick={() => router.push('/choose')}
            className={cn(
              "h-20 w-20 rounded-full border-4 active:scale-95 transition-all",
              isAtBoundary 
                ? "border-red-500 bg-red-500/30 text-red-500 pointer-events-none" 
                : "border-white bg-white/30 hover:bg-white/50 text-white pointer-events-auto"
            )}
            aria-label="Retake photo"
          >
            <RefreshCw className="h-9 w-9" />
         </Button>
      </div>

    </div>
  );
};

export default ColorPickerView;
