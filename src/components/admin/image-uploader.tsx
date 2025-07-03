
"use client";

import React, { useCallback } from 'react';
import { useDropzone, Accept, DropzoneOptions } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  label: string;
  preview: string | null | undefined;
  onDrop: (base64: string | ArrayBuffer | null) => void;
  onRemove: () => void;
  accept?: Accept;
  dropzoneOptions?: Omit<DropzoneOptions, 'accept' | 'onDrop'>;
}

export function ImageUploader({
  label,
  preview,
  onDrop,
  onRemove,
  accept,
  dropzoneOptions,
}: ImageUploaderProps) {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          title: "File Upload Error",
          description: fileRejections[0].errors[0].message,
          variant: "destructive",
        });
        return;
      }
      
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onDrop(e.target?.result ?? null);
        };
        reader.readAsDataURL(file);
      }
    },
    [onDrop, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    ...dropzoneOptions,
  });

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div
        {...getRootProps()}
        className={cn(
          'relative group border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-input',
          !preview && 'cursor-pointer hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative aspect-video w-full">
            <Image src={preview} alt="Preview" layout="fill" objectFit="contain" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                 >
                    <X className="h-4 w-4" />
                </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-6">
            <UploadCloud className="w-8 h-8" />
            <p className="text-sm">Drag & drop or click to upload</p>
          </div>
        )}
      </div>
      <FormMessage />
    </div>
  );
}
