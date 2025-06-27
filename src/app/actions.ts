'use server';

import { z } from 'zod';

const ImageSchema = z.object({
  id: z.number(),
  photographer: z.string(),
  photographer_url: z.string(),
  src: z.object({
    portrait: z.string(),
  }),
  alt: z.string(),
});

type PexelsImage = z.infer<typeof ImageSchema>;

type ImageData = {
    src: string;
    photographer: string;
    photographerUrl: string;
    hint: string;
}

export async function getPexelsImages(ids: number[]): Promise<Record<number, ImageData>> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error("PEXELS_API_KEY is not set.");
    return {};
  }

  const requests = ids.map(id => 
    fetch(`https://api.pexels.com/v1/photos/${id}`, {
      headers: { Authorization: apiKey },
    }).then(res => {
        if (!res.ok) {
            console.error(`Pexels API error for ID ${id}: ${res.statusText}`);
            return null;
        }
        return res.json();
    }).catch(err => {
        console.error(`Fetch failed for Pexels ID ${id}:`, err);
        return null;
    })
  );

  const results = await Promise.all(requests);
  
  const imageData: Record<number, ImageData> = {};

  for (const data of results) {
    if (data && data.id) {
       const validatedData = ImageSchema.safeParse(data);
       if (validatedData.success) {
            const { id, src, photographer, photographer_url, alt } = validatedData.data;
            imageData[id] = {
                src: src.portrait,
                photographer,
                photographerUrl: photographer_url,
                hint: alt,
            };
       } else {
            console.error(`Pexels API response validation error for ID ${data.id}:`, validatedData.error);
       }
    }
  }
  return imageData;
}
