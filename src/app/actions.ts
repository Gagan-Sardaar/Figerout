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

const PexelsSearchSchema = z.object({
  photos: z.array(z.object({
    src: z.object({
      portrait: z.string(),
    }),
  })),
});

export async function searchPexelsImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error("PEXELS_API_KEY is not set.");
    return null;
  }

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      console.error(`Pexels API search error for query "${query}": ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const validatedData = PexelsSearchSchema.safeParse(data);

    if (validatedData.success && validatedData.data.photos.length > 0) {
      return validatedData.data.photos[0].src.portrait;
    } else {
      if (!validatedData.success) {
        console.error(`Pexels API search response validation error for query "${query}":`, validatedData.error);
      }
      return null;
    }
  } catch (err) {
    console.error(`Fetch failed for Pexels search query "${query}":`, err);
    return null;
  }
}
