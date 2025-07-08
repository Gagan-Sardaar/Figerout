
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FilePenLine, Palette, Trash2, Loader2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateColorShades, isColorLight } from '@/lib/color-utils';
import { getUsers, FirestoreUser } from '@/services/user-service';
import { getSavedColors, deleteColor, updateColorNote, SavedColor } from '@/services/color-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type DialogState = {
    isOpen: boolean;
    type: 'note' | 'shades' | null;
    color: SavedColor | null;
    userId: string | null;
};

type UserWithColors = FirestoreUser & {
    colors: SavedColor[];
};

export default function AdminColorsPage() {
    const [usersWithColors, setUsersWithColors] = useState<UserWithColors[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, color: null, userId: null });
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role !== 'Admin') {
                router.replace('/admin');
                return;
            }
        } else {
            router.replace('/login');
            return;
        }

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const users = await getUsers();
                const usersWithColorsData = await Promise.all(
                    users.map(async (user) => {
                        const colors = await getSavedColors(user.id);
                        return { ...user, colors: colors.sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()) };
                    })
                );
                setUsersWithColors(usersWithColorsData.filter(u => u.colors.length > 0));
            } catch (error) {
                console.error("Failed to fetch user and color data:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch user and color data.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [router, toast]);

    const handleDeleteColor = async (userId: string, hex: string) => {
        const colorToDelete = usersWithColors.find(u => u.id === userId)?.colors.find(c => c.hex === hex);
        if (!colorToDelete) return;

        await deleteColor(userId, hex);
        setUsersWithColors(prev => prev.map(user => 
            user.id === userId
                ? { ...user, colors: user.colors.filter(c => c.hex !== hex) }
                : user
        ).filter(u => u.colors.length > 0));
        
        toast({
          title: "Color Removed",
          description: `The color ${colorToDelete.name} has been removed from the user's collection.`,
        });
    };

    const openNoteDialog = (userId: string, color: SavedColor) => {
        setNoteContent(color.note || '');
        setDialogState({ isOpen: true, type: 'note', color, userId });
    };

    const openShadesDialog = (color: SavedColor) => {
        setDialogState({ isOpen: true, type: 'shades', color, userId: null });
    };

    const handleSaveNote = async () => {
        if (!dialogState.color || !dialogState.userId) return;
        
        await updateColorNote(dialogState.userId, dialogState.color.hex, noteContent);
        
        setUsersWithColors(prev => prev.map(user => 
            user.id === dialogState.userId ? {
                ...user,
                colors: user.colors.map(c => 
                    c.hex === dialogState.color!.hex ? { ...c, note: noteContent } : c
                )
            } : user
        ));

        toast({
            title: "Note Saved",
            description: `The note for ${dialogState.color.name} has been saved.`,
        });
        
        setDialogState({ isOpen: false, type: null, color: null, userId: null });
    };

    const colorShades = useMemo(() => {
        if (dialogState.type === 'shades' && dialogState.color) {
            return generateColorShades(dialogState.color.hex, 5);
        }
        return { lighter: [], darker: [] };
    }, [dialogState]);
    
    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center h-full p-6">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (usersWithColors.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 text-center text-muted-foreground m-8">
                <Users className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Saved Colors Found</h3>
                <p className="mt-2">
                  No users have saved any colors yet.
                </p>
            </div>
        );
    }
    
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">User Color Collections</h1>
            </div>
            <p className="text-muted-foreground">Browse all colors saved by users across the application.</p>
            
            <Accordion type="single" collapsible className="w-full" defaultValue={usersWithColors[0]?.id}>
                {usersWithColors.map(user => (
                    <AccordionItem value={user.id} key={user.id}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>{user.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground font-normal">{user.email} - {user.colors.length} color{user.colors.length === 1 ? '' : 's'}</div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                                {user.colors.map(color => (
                                    <Card key={color.hex} className="bg-card text-card-foreground rounded-xl flex flex-col overflow-hidden shadow-md transition-transform hover:-translate-y-1">
                                        <div 
                                            style={{ backgroundColor: color.hex }} 
                                            className="h-10 relative flex items-center justify-end p-2 group cursor-pointer"
                                            onClick={() => openShadesDialog(color)}
                                        >
                                            <Palette className={cn(
                                                "w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity",
                                                isColorLight(color.hex) ? "text-black" : "text-white"
                                            )} />
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-medium">{color.name}</h3>
                                                <div className="flex items-center gap-0 -mt-1 -mr-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openNoteDialog(user.id, color)}>
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
                                                                    This will permanently delete the color '{color.name}' ({color.hex}) for {user.name}. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteColor(user.id, color.hex)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                            <div className="flex-grow flex items-center">
                                                <p className="text-4xl font-light text-foreground">{color.hex.toUpperCase()}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Saved {formatDistanceToNow(new Date(color.sharedAt), { addSuffix: true })}
                                            </p>
                                            {color.note && (
                                                <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-muted/50 pl-3 line-clamp-2">
                                                    {color.note}
                                                </p>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            
            <Dialog open={dialogState.isOpen} onOpenChange={() => setDialogState({ isOpen: false, type: null, color: null, userId: null })}>
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
