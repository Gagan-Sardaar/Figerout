
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FilePenLine, Palette, Trash2, Camera, Image as ImageIcon, ExternalLink, Brush } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { generateColorShades, isColorLight } from "@/lib/color-utils";
import type { User } from "@/lib/user-data";
import {
    onSavedColorsChange,
    deleteColor,
    updateColorNote,
    type SavedColor,
} from "@/services/color-service";

type FilterType = 'all' | 'daily' | 'weekly' | 'monthly';

type DialogState = {
    isOpen: boolean;
    type: 'note' | 'shades' | null;
    color: SavedColor | null;
}

export default function VisitorDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userName, setUserName] = useState("Visitor");
  const [user, setUser] = useState<User | null>(null);
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, color: null });
  const [noteContent, setNoteContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            setUserName(userData.name);
            setUser(userData);
        } catch (e) { console.error(e) }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = onSavedColorsChange(user.id, (colors) => {
        setSavedColors(colors);
      });
      return () => unsubscribe(); // Cleanup subscription on unmount
    }
  }, [user]);

  const resizeImage = (dataUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_DIMENSION = 1280;
              let { width, height } = img;
              const aspectRatio = width / height;

              if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                  if (aspectRatio > 1) { // Landscape
                      width = MAX_DIMENSION;
                      height = MAX_DIMENSION / aspectRatio;
                  } else { // Portrait
                      height = MAX_DIMENSION;
                      width = MAX_DIMENSION * aspectRatio;
                  }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  return reject(new Error('Could not get canvas context'));
              }
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG for compression
          };
          img.onerror = reject;
          img.src = dataUrl;
      });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
            const dataUrl = reader.result as string;
            const resizedDataUrl = await resizeImage(dataUrl);
            sessionStorage.setItem('capturedImage', resizedDataUrl);
            router.push('/picker');
        } catch(error) {
            console.error(error);
            toast({
                title: 'Error processing image',
                description: 'The image could not be loaded or resized.',
                variant: 'destructive',
            });
        }
      };
      reader.onerror = () => {
        toast({
            title: 'Error reading file',
            description: 'Something went wrong while trying to load your image.',
            variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  const filteredColors = useMemo(() => {
    const now = new Date();
    return savedColors.filter(color => {
      const colorDate = new Date(color.sharedAt);
      switch (activeFilter) {
        case 'daily':
          return now.toDateString() === colorDate.toDateString();
        case 'weekly':
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return colorDate >= oneWeekAgo;
        case 'monthly':
           const oneMonthAgo = new Date(now);
           oneMonthAgo.setMonth(now.getMonth() - 1);
           return colorDate >= oneMonthAgo;
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
  }, [savedColors, activeFilter]);

  const handleDeleteColor = async (hex: string) => {
    if (!user?.id) return;
    const colorToDelete = savedColors.find(c => c.hex === hex);
    if (!colorToDelete) return;

    await deleteColor(user.id, hex);
    // No need to set state here, the real-time listener will handle it
    toast({
      title: "Color Removed",
      description: `The color ${colorToDelete.name} has been removed from your collection.`,
    });
  };

  const openNoteDialog = (color: SavedColor) => {
    setNoteContent(color.note || '');
    setDialogState({ isOpen: true, type: 'note', color });
  };
  
  const openShadesDialog = (color: SavedColor) => {
    setDialogState({ isOpen: true, type: 'shades', color });
  };

  const handleSaveNote = async () => {
    if (!dialogState.color || !user?.id) return;
    await updateColorNote(user.id, dialogState.color.hex, noteContent);
    // No need to set state here, the real-time listener will handle it
    toast({
      title: "Note Saved",
      description: `Your note for ${dialogState.color.name} has been saved.`,
    });
    setDialogState({ isOpen: false, type: null, color: null });
  };
  
  const colorShades = useMemo(() => {
      if (dialogState.type === 'shades' && dialogState.color) {
          return generateColorShades(dialogState.color.hex, 5);
      }
      return { lighter: [], darker: [] };
  }, [dialogState]);

  return (
    <div className="bg-background text-foreground flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        
        <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col">
          <Card className="bg-primary text-primary-foreground p-4 md:p-6 rounded-2xl flex flex-col flex-grow">
              <Avatar className="h-12 w-12 md:h-16 md:w-16 mb-4 hidden md:flex">
              <AvatarFallback className="text-2xl md:text-3xl font-bold bg-primary-foreground/20 text-primary-foreground">
                  {user?.initials}
              </AvatarFallback>
              </Avatar>
              <h1 className="text-xl md:text-3xl font-bold truncate">{userName}</h1>
              <p className="text-xs md:text-sm text-primary-foreground/60 mt-1 truncate">{user?.email}</p>

              <div className="space-y-2 pt-6">
                <Button asChild className="w-full justify-start text-base px-3 py-2 h-auto bg-black text-primary-foreground/90 hover:bg-zinc-800">
                  <Link href="/choose" className="flex items-center gap-3">
                    <Brush className="w-4 h-4" />
                    <span>Find New Color</span>
                  </Link>
                </Button>
                 <Button asChild variant="outline" className="w-full justify-start text-base px-3 py-2 h-auto bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground/90 hover:bg-primary-foreground/20">
                    <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit Website</span>
                    </Link>
                 </Button>
              </div>

              <div className="mt-auto">
                {user?.role === 'Admin' && (
                    <div className="pt-4">
                        <Button asChild variant="ghost" className="w-full justify-start text-base px-3 py-2 h-auto text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white">
                           <Link href="/admin">
                            Switch to Admin View
                           </Link>
                        </Button>
                    </div>
                )}
              </div>
          </Card>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="mb-6 overflow-x-auto pb-2 -mx-2 px-2">
              <div className="flex items-center gap-2 flex-nowrap w-max">
                  {(['all', 'daily', 'weekly', 'monthly'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? "secondary" : "ghost"}
                      size="sm"
                      className="capitalize"
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </Button>
                  ))}
              </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
            {filteredColors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredColors.map(color => (
                  <Card key={color.hex} className="bg-card text-card-foreground rounded-2xl flex flex-col overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
                    <div 
                      style={{ backgroundColor: color.hex }} 
                      className="h-10 relative flex items-center justify-end p-2 group cursor-pointer"
                      onClick={() => openShadesDialog(color)}
                    >
                        <Palette className={cn(
                          "w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none",
                          isColorLight(color.hex) ? "text-black" : "text-white"
                        )} />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium">{color.name}</h3>
                          <div className="flex items-center gap-0 -mt-2 -mr-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openNoteDialog(color)}>
                                  <FilePenLine className="h-4 w-4" />
                                  <span className="sr-only">Add/Edit Note</span>
                              </Button>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Delete Color</span>
                                      </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This will permanently delete the color '{color.name}' ({color.hex}). This action cannot be undone.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteColor(color.hex)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </div>
                      </div>
                      <div className="flex-grow flex items-center">
                          <p className="text-3xl font-light text-foreground">{color.hex.toUpperCase()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Saved {formatDistanceToNow(new Date(color.sharedAt), { addSuffix: true })}
                      </p>
                      {color.note && (
                          <p className="mt-4 text-sm text-muted-foreground italic border-l-2 border-muted/50 pl-3 line-clamp-3">
                              {color.note}
                          </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 text-center text-muted-foreground">
                  <Palette className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">No Colors Saved Yet</h3>
                  <p className="mt-2">
                    You haven't saved any colors for this period.
                  </p>
              </div>
            )}
          </div>
        </div>

      </div>

       <Dialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isOpen: false, type: null, color: null })}>
            <DialogContent className="max-h-[90svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {dialogState.type === 'note' ? (dialogState.color?.note ? 'Edit Note' : 'Add Note') : 'Color Shades'}
                    </DialogTitle>
                </DialogHeader>
                {dialogState.type === 'note' && (
                    <div className="py-4">
                        <Textarea 
                            placeholder="Add a note about this color..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                )}
                {dialogState.type === 'shades' && dialogState.color && (
                     <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
                         {[...colorShades.darker, dialogState.color.hex, ...colorShades.lighter].map((shade, index) => (
                             <div key={`${shade}-${index}`} className="flex items-center gap-4 p-2 rounded-md" style={{ backgroundColor: shade }}>
                                 <p className="font-mono font-bold" style={{ color: isColorLight(shade) ? '#000' : '#fff' }}>{shade.toUpperCase()}</p>
                             </div>
                         ))}
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    {dialogState.type === 'note' && (
                        <Button onClick={handleSaveNote}>Save Note</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
