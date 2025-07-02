
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  photographer: string;
  photographerUrl: string;
  views: number;
  likes: number;
  shares: number;
  status: 'published' | 'draft' | 'private' | 'password-protected';
  lastUpdated: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  seoScore?: number;
}

const getDateAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const placeholderContent = `\n\nThis is a continuation of the article. Further points are discussed in detail here, providing more insights and information on the topic. We explore various aspects and provide a comprehensive overview for the reader.\n\nOur analysis delves deeper into the subject matter, offering examples and case studies to illustrate the key takeaways. We believe this thorough approach will help you better understand the complexities involved. Thank you for reading.`;


export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'top-10-eco-friendly-products',
    title: 'Top 10 Eco-Friendly Products for Your Home',
    summary: 'As more and more people become aware of the impact that our lifestyles have on the environment, the demand for eco-friendly products is on the rise.',
    content: 'As more and more people become aware of the impact that our lifestyles have on the environment, the demand for eco-friendly products is on the rise.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'eco friendly products',
    photographer: 'Sarah Chai',
    photographerUrl: 'https://www.pexels.com/@sarah-chai-1994500/',
    views: 1200,
    likes: 345,
    shares: 89,
    status: 'published',
    lastUpdated: getDateAgo(1),
    metaTitle: '10 Must-Have Eco-Friendly Home Products',
    metaDescription: 'Discover the top 10 eco-friendly products that can help you create a more sustainable and environmentally conscious home. Start making a difference today.',
    focusKeywords: ['eco-friendly products', 'sustainable home', 'green living'],
    seoScore: 85,
  },
  {
    id: 2,
    slug: 'impact-of-climate-change',
    title: 'The Impact of Climate Change on Biodiversity',
    summary: 'Climate change is one of the most pressing issues facing our planet today. Rising temperatures, extreme weather events, and sea-level rise are threatening ecosystems worldwide.',
    content: 'Climate change is one of the most pressing issues facing our planet today. Rising temperatures, extreme weather events, and sea-level rise are threatening ecosystems worldwide.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/14751274/pexels-photo-14751274.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'climate change biodiversity',
    photographer: 'Pexels',
    photographerUrl: 'https://www.pexels.com',
    views: 2500,
    likes: 780,
    shares: 150,
    status: 'published',
    lastUpdated: getDateAgo(3),
    metaTitle: 'How Climate Change Affects Global Biodiversity',
    metaDescription: 'Explore the profound impact of climate change on biodiversity, from coral reefs to rainforests. Understand the threats and what can be done to protect our planet.',
    focusKeywords: ['climate change', 'biodiversity', 'ecosystems', 'environmental impact'],
    seoScore: 92,
  },
  {
    id: 3,
    slug: 'benefits-of-sustainable-business',
    title: 'The Benefits of Sustainable Business Practices',
    summary: 'Sustainability has become an increasingly important issue for businesses in recent years. Adopting sustainable practices is not just good for the environment, it’s good for business.',
    content: 'Sustainability has become an increasingly important issue for businesses in recent years. Adopting sustainable practices is not just good for the environment, it’s good for business.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'sustainable business',
    photographer: 'Jopwell',
    photographerUrl: 'https://www.pexels.com/@jopwell/',
    views: 850,
    likes: 210,
    shares: 45,
    status: 'draft',
    lastUpdated: getDateAgo(0),
    metaTitle: 'Why Sustainable Business is Good for Business',
    metaDescription: 'Learn about the key benefits of adopting sustainable business practices, from improved brand reputation to increased profitability and long-term success.',
    focusKeywords: ['sustainable business', 'corporate sustainability', 'green business'],
    seoScore: 78,
  },
   {
    id: 4,
    slug: 'the-psychology-of-color-in-marketing',
    title: 'The Psychology of Color in Marketing',
    summary: 'Discover how different colors influence consumer behavior and how you can use this knowledge to create more effective marketing campaigns.',
    content: 'Discover how different colors influence consumer behavior and how you can use this knowledge to create more effective marketing campaigns.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/399161/pexels-photo-399161.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'color marketing psychology',
    photographer: 'Designecologist',
    photographerUrl: 'https://www.pexels.com/@designecologist/',
    views: 3100,
    likes: 950,
    shares: 220,
    status: 'published',
    lastUpdated: getDateAgo(5),
    metaTitle: 'Color Psychology in Marketing: A Complete Guide',
    metaDescription: 'A deep dive into the psychology of color in marketing. Learn how colors like red, blue, and green can influence purchasing decisions and brand perception.',
    focusKeywords: ['color psychology', 'marketing', 'consumer behavior', 'branding'],
    seoScore: 88,
  },
  {
    id: 5,
    slug: 'a-guide-to-minimalist-wardrobe-palettes',
    title: 'A Guide to Minimalist Wardrobe Palettes',
    summary: 'Learn how to build a stylish and versatile wardrobe with a limited color palette. Simplify your life and always look put-together.',
    content: 'Learn how to build a stylish and versatile wardrobe with a limited color palette. Simplify your life and always look put-together.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/10404244/pexels-photo-10404244.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'minimalist wardrobe',
    photographer: 'Lana Fashion',
    photographerUrl: 'https://www.pexels.com/@lana-fashion-102575258/',
    views: 1800,
    likes: 560,
    shares: 110,
    status: 'private',
    lastUpdated: getDateAgo(8),
    metaTitle: 'How to Create a Minimalist Wardrobe Color Palette',
    metaDescription: 'Our guide to building a minimalist wardrobe. Learn how to choose a versatile color palette that simplifies your style and elevates your look.',
    focusKeywords: ['minimalist wardrobe', 'color palette', 'capsule wardrobe', 'fashion'],
    seoScore: 82,
  },
  {
    id: 6,
    slug: 'how-interior-colors-affect-your-mood',
    title: 'How Interior Colors Can Affect Your Mood',
    summary: 'The colors you choose for your home can have a significant impact on your emotions and well-being. Find the perfect shades for a happy home.',
    content: 'The colors you choose for your home can have a significant impact on your emotions and well-being. Find the perfect shades for a happy home.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'interior design colors',
    photographer: 'Veejay Villafranca',
    photographerUrl: 'https://www.pexels.com/@veejay-villafranca-75573/',
    views: 1500,
    likes: 420,
    shares: 95,
    status: 'password-protected',
    lastUpdated: getDateAgo(10),
    metaTitle: 'Using Interior Colors to Boost Your Mood',
    metaDescription: 'Explore the connection between interior design colors and your mood. Learn which colors can make you feel happy, calm, or energized in your own home.',
    focusKeywords: ['interior design', 'color theory', 'home decor', 'mood'],
  },
  {
    id: 7,
    slug: 'figerout-in-daily-life',
    title: 'Beyond Design: Fun and Practical Ways to Use Figerout Every Day',
    summary: 'Discover how Figerout can brighten your daily tasks and bring a new level of fun to your routines. From matching your outfit to planning a party, learn how capturing colors can make the mundane magical.',
    content: 'Discover how Figerout can brighten your daily tasks and bring a new level of fun to your routines. From matching your outfit to planning a party, learn how capturing colors can make the mundane magical.' + placeholderContent,
    imageUrl: 'https://images.pexels.com/photos/7973302/pexels-photo-7973302.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'colorful daily life',
    photographer: 'Liza Summer',
    photographerUrl: 'https://www.pexels.com/@liza-summer/',
    views: 980,
    likes: 250,
    shares: 60,
    status: 'published',
    lastUpdated: getDateAgo(0),
    metaTitle: 'Practical and Fun Uses for the Figerout App',
    metaDescription: 'Figerout isn\'t just for designers! Discover fun and practical ways to use our color-capturing app in your daily life, from fashion to event planning.',
    focusKeywords: ['Figerout app', 'daily uses', 'color matching', 'creative apps'],
  },
];
