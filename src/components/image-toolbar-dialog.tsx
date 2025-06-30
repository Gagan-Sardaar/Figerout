
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Search, Loader2, Wand2 } from "lucide-react";
import { PexelsSearchImage, searchPexelsImage } from "@/app/actions";

interface ImageToolbarDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onInsertImage: (markdown: string) => void;
}

export function ImageToolbarDialog({ isOpen, onOpenChange, onInsertImage }: ImageToolbarDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  
  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PexelsSearchImage | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const result = await searchPexelsImage(searchQuery);
      if (result) {
        setSearchResult(result);
      } else {
        toast({
          title: "No image found",
          description: `Could not find an image for "${searchQuery}". Try a different search term.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Search failed", description: "Could not connect to the image service.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInsert = () => {
    let markdown = "";
    if (activeTab === "upload" && uploadedImage) {
      markdown = `![Uploaded Image](${uploadedImage})`;
    } else if (activeTab === "search" && searchResult) {
      const { dataUri, photographer, photographerUrl, alt } = searchResult;
      markdown = `![${alt}](${dataUri})\n*Photo by [${photographer}](${photographerUrl})*`;
    }

    if (markdown) {
      onInsertImage(markdown);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state on close
    setTimeout(() => {
        setUploadedImage(null);
        setSearchQuery("");
        setSearchResult(null);
        setIsSearching(false);
        setActiveTab("upload");
    }, 300); // delay to allow dialog to animate out
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Image to Content</DialogTitle>
          <DialogDescription>
            Upload an image from your device or search for one from Pexels.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="search">Search Pexels</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <div
              {...getRootProps()}
              className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors h-64 flex flex-col items-center justify-center ${
                isDragActive ? "border-primary bg-primary/10" : "border-input"
              } ${!uploadedImage && "cursor-pointer hover:border-primary/50"}`}
            >
              <input {...getInputProps()} />
              {uploadedImage ? (
                <div className="relative w-full h-full">
                  <Image src={uploadedImage} alt="Preview" layout="fill" objectFit="contain" />
                </div>
              ) : (
                <>
                  <UploadCloud className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Drag & drop an image here, or click to select a file
                  </p>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="search">
            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
              <Input
                placeholder="e.g., vibrant colors abstract"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
              </Button>
            </form>
            <div className="mt-4 h-64 flex items-center justify-center bg-muted rounded-lg">
              {isSearching && <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />}
              {searchResult && !isSearching && (
                <div className="relative w-full h-full">
                  <Image src={searchResult.dataUri} alt={searchResult.alt} layout="fill" objectFit="contain" className="rounded-lg" />
                </div>
              )}
              {!searchResult && !isSearching && (
                <div className="text-center text-muted-foreground">
                  <Wand2 className="w-12 h-12 mx-auto" />
                  <p className="mt-4">Search results will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleInsert} disabled={(!uploadedImage && activeTab === 'upload') || (!searchResult && activeTab === 'search')}>
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
