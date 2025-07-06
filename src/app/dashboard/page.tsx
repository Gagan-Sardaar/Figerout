"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Save, Lock, Palette, Copy } from "lucide-react";
import { getColorName } from "@/lib/color-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

type SavedColor = {
    hex: string;
    name: string;
    sharedAt: string;
}

export default function VisitorDashboardPage() {
  const { toast } = useToast();
  const [userName, setUserName] = useState("Visitor");
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            setUserName(JSON.parse(storedUser).name);
        } catch (e) { console.error(e) }
    }

    const storedColors = localStorage.getItem('savedColors');
    if (storedColors) {
        try {
            setSavedColors(JSON.parse(storedColors).sort((a: SavedColor, b: SavedColor) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()));
        } catch (e) { console.error(e) }
    }
  }, []);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = (data: PasswordFormValues) => {
    console.log(data); // In a real app, this would be an API call
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    passwordForm.reset();
  };
  
  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      toast({
        title: "Color Copied!",
        description: `${hex} copied to clipboard.`,
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

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {userName}!</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Lock className="w-5 h-5"/> Change Password
                        </CardTitle>
                        <CardDescription>Update your account password here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                <Save className="mr-2 h-4 w-4" /> Update Password
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5" /> My Saved Colors
                        </CardTitle>
                        <CardDescription>A collection of all the colors you've saved.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {savedColors.length > 0 ? (
                            <TooltipProvider>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {savedColors.map((color, index) => (
                                    <Tooltip key={index} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <div className="group relative aspect-square rounded-lg shadow-sm cursor-pointer" style={{ backgroundColor: color.hex }} onClick={() => handleCopyColor(color.hex)}>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Copy className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{color.name}</p>
                                            <p className="font-mono">{color.hex}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(color.sharedAt).toLocaleString()}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                </div>
                            </TooltipProvider>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Palette className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground">No Colors Saved Yet</h3>
                                <p className="mt-2 text-sm">Use the camera to find colors and share them to save them here.</p>
                                <Button asChild className="mt-4">
                                    <a href="/camera">Find Colors</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
