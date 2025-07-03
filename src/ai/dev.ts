import { config } from 'dotenv';
config();

import '@/ai/flows/generate-blog-post.ts';
import '@/ai/flows/generate-seo-content.ts';
import '@/ai/flows/analyze-color-palette.ts';
import '@/ai/flows/extract-dominant-colors.ts';
import '@/ai/flows/extract-image-keywords.ts';
import '@/ai/flows/generate-seo-score.ts';
import '@/ai/flows/generate-page-content.ts';
import '@/ai/flows/suggest-seo-improvements.ts';
