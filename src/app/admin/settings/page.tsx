
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Save, Image as ImageIcon, Link2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";

// SVGs for social icons as they are not in lucide-react
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
);

const settingsSchema = z.object({
  metaTitle: z.string().max(60, "Meta title should be 60 characters or less."),
  metaDescription: z.string().max(160, "Meta description should be 160 characters or less."),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  socialImage: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(["facebook", "instagram"]),
    url: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
  })).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const defaultValues: SettingsFormValues = {
  metaTitle: "",
  metaDescription: "",
  logo: "",
  favicon: "",
  socialImage: "",
  socialLinks: [
    { platform: "facebook", url: "" },
    { platform: "instagram", url: "" },
  ],
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });
  
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        form.reset(parsedSettings);
        const lastSavedTimestamp = localStorage.getItem("appSettingsLastSaved");
        if (lastSavedTimestamp) {
            setLastSaved(new Date(lastSavedTimestamp));
        }
      } catch (e) {
        console.error("Failed to parse app settings from localStorage", e);
      }
    }
    setIsMounted(true);
  }, [form]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  const onSubmit = (data: SettingsFormValues) => {
    const now = new Date();
    localStorage.setItem("appSettings", JSON.stringify(data));
    localStorage.setItem("appSettingsLastSaved", now.toISOString());
    setLastSaved(now);
    toast({
      title: "Settings Saved!",
      description: "Your application settings have been updated.",
    });
  };

  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">App Settings</h1>
            <div className="flex items-center gap-4">
              {lastSaved && <p className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleString()}</p>}
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>SEO & Metadata</CardTitle>
                        <CardDescription>
                        Manage your website's appearance on search engines.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Website Title" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="A brief description of your website for search results."
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Add links to your social media profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field: fieldProps }) => (
                            <FormItem>
                                <FormLabel className="capitalize flex items-center gap-2">
                                {field.platform === 'facebook' ? <FacebookIcon className="w-4 h-4"/> : <InstagramIcon className="w-4 h-4"/>}
                                {field.platform}
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input {...fieldProps} placeholder={`https://www.${field.platform}.com/your-profile`} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Site Identity</CardTitle>
                        <CardDescription>Upload your logo and favicon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <ImageUploader
                                    label="Logo"
                                    preview={field.value}
                                    onDrop={(base64) => form.setValue("logo", base64 as string, { shouldValidate: true, shouldDirty: true })}
                                    onRemove={() => form.setValue("logo", "", { shouldValidate: true, shouldDirty: true })}
                                    accept={{ "image/png": [".png"], "image/svg+xml": [".svg"] }}
                                    dropzoneOptions={{ maxSize: 1024 * 1024 }}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="favicon"
                            render={({ field }) => (
                                <ImageUploader
                                    label="Favicon"
                                    preview={field.value}
                                    onDrop={(base64) => form.setValue("favicon", base64 as string, { shouldValidate: true, shouldDirty: true })}
                                    onRemove={() => form.setValue("favicon", "", { shouldValidate: true, shouldDirty: true })}
                                    accept={{ "image/png": [".png"], "image/svg+xml": [".svg"] }}
                                    dropzoneOptions={{ maxSize: 256 * 1024 }}
                                />
                            )}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Social Share Image</CardTitle>
                        <CardDescription>The default image used when your site is shared.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="socialImage"
                            render={({ field }) => (
                                <ImageUploader
                                    label="Social Share Image (1200x630px recommended)"
                                    preview={field.value}
                                    onDrop={(base64) => form.setValue("socialImage", base64 as string, { shouldValidate: true, shouldDirty: true })}
                                    onRemove={() => form.setValue("socialImage", "", { shouldValidate: true, shouldDirty: true })}
                                    accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }}
                                    dropzoneOptions={{ maxSize: 2 * 1024 * 1024 }}
                                />
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
