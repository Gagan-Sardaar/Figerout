
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { MoreHorizontal, FilePenLine, Palette, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { generateColorShades } from "@/lib/color-utils";

type SavedColor = {
    hex: string;
    name: string;
    sharedAt: string;
    note?: string;
}

type FilterType = 'all' | 'daily' | 'weekly' | 'monthly';

type DialogState = {
    isOpen: boolean;
    type: 'note' | 'shades' | null;
    color: SavedColor | null;
}

export default function VisitorDashboardPage() {
  const { toast } = useToast();
  const [userName, setUserName] = useState("Visitor");
  const [userEmail, setUserEmail] = useState("visitor@figerout.com");
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, color: null });
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            setUserName(user.name);
            setUserEmail(user.email);
        } catch (e) { console.error(e) }
    }

    const storedColors = localStorage.getItem('savedColors');
    if (storedColors) {
        try {
            setSavedColors(JSON.parse(storedColors));
        } catch (e) { console.error(e) }
    }
  }, []);

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

  const handleDeleteColor = (hex: string) => {
    const updatedColors = savedColors.filter(color => color.hex !== hex);
    setSavedColors(updatedColors);
    localStorage.setItem('savedColors', JSON.stringify(updatedColors));
    toast({
      title: "Color Removed",
      description: `The color ${hex} has been removed from your collection.`,
    });
  };

  const openNoteDialog = (color: SavedColor) => {
    setNoteContent(color.note || '');
    setDialogState({ isOpen: true, type: 'note', color });
  };
  
  const openShadesDialog = (color: SavedColor) => {
    setDialogState({ isOpen: true, type: 'shades', color });
  };

  const handleSaveNote = () => {
    if (!dialogState.color) return;
    const updatedColors = savedColors.map(c => 
      c.hex === dialogState.color!.hex ? { ...c, note: noteContent } : c
    );
    setSavedColors(updatedColors);
    localStorage.setItem('savedColors', JSON.stringify(updatedColors));
    toast({
      title: "Note Saved",
      description: `Your note for ${dialogState.color.hex} has been saved.`,
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
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1">
          <Card className="bg-primary text-primary-foreground p-6 rounded-2xl h-full flex flex-col">
            <Avatar className="h-16 w-16 mb-4">
              <AvatarFallback className="text-3xl font-bold bg-primary-foreground/20 text-primary-foreground">
                F
              </AvatarFallback>
            </Avatar>
            <p className="text-primary-foreground/80">Saved Colors for</p>
            <h1 className="text-3xl font-bold">{userName}</h1>
            <p className="text-sm text-primary-foreground/60 mt-1 truncate">{userEmail}</p>
            
            <nav className="mt-8 space-y-1">
              {(['all', 'daily', 'weekly', 'monthly'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant="ghost"
                  className={cn(
                      "w-full justify-start text-lg capitalize px-3 py-2 h-auto",
                      activeFilter === filter ? "text-white font-semibold" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white"
                  )}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All Time' : filter}
                </Button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {filteredColors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredColors.map(color => (
                <Card key={color.hex} className="bg-card text-card-foreground rounded-2xl flex flex-col overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
                  <div style={{ backgroundColor: color.hex }} className="h-10 relative flex items-center justify-end p-2">
                      <Palette className="w-8 h-8 text-black opacity-10" />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">{color.name}</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground">
                                <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => openNoteDialog(color)}>
                                    <FilePenLine className="mr-2 h-4 w-4" />
                                    <span>{color.note ? 'Edit Note' : 'Add Note'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openShadesDialog(color)}>
                                    <Palette className="mr-2 h-4 w-4" />
                                    <span>View Shades</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteColor(color.hex)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex-grow flex items-center">
                        <p className="text-5xl font-light text-foreground">{color.hex.toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Saved {formatDistanceToNow(new Date(color.sharedAt), { addSuffix: true })}
                    </p>
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
                <Button asChild className="mt-4">
                  <a href="/camera">Find Colors</a>
                </Button>
            </div>
          )}
        </div>

      </div>

       <Dialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isOpen: false, type: null, color: null })}>
            <DialogContent>
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
                             <div key={index} className="flex items-center gap-4 p-2 rounded-md" style={{ backgroundColor: shade }}>
                                 <p className="font-mono font-bold" style={{ color: index > 4 ? '#000' : '#fff' }}>{shade.toUpperCase()}</p>
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
