
'use server';

import { z } from 'zod';

const PexelsSearchSchema = z.object({
  photos: z.array(z.object({
    src: z.object({
      portrait: z.string(),
      large: z.string(),
      landscape: z.string(),
      medium: z.string(),
    }),
    photographer: z.string(),
    photographer_url: z.string(),
    alt: z.string(),
  })),
});

export type PexelsSearchImage = {
    dataUri: string;
    photographer: string;
    photographerUrl: string;
    alt: string;
}

export async function searchPexelsImage(query: string): Promise<PexelsSearchImage | null> {
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
      const photo = validatedData.data.photos[0];
      const imageUrl = photo.src.medium;
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error(`Failed to fetch Pexels image from URL: ${imageUrl}`);
        return null;
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const dataUri = `data:${contentType};base64,${base64}`;

      return {
          dataUri,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          alt: photo.alt,
      }

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
