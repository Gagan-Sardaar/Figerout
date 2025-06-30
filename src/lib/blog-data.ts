
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  imageHint: string;
  photographer: string;
  photographerUrl: string;
  views: number;
  likes: number;
  shares: number;
  status: 'published' | 'draft' | 'private' | 'password-protected';
  lastUpdated: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'top-10-eco-friendly-products',
    title: 'Top 10 Eco-Friendly Products for Your Home',
    summary: 'As more and more people become aware of the impact that our lifestyles have on the environment, the demand for eco-friendly products is on the rise.',
    imageUrl: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'eco friendly products',
    photographer: 'Sarah Chai',
    photographerUrl: 'https://www.pexels.com/@sarah-chai-1994500/',
    views: 1200,
    likes: 345,
    shares: 89,
    status: 'published',
    lastUpdated: '2024-05-20T10:00:00Z',
  },
  {
    id: 2,
    slug: 'impact-of-climate-change',
    title: 'The Impact of Climate Change on Biodiversity',
    summary: 'Climate change is one of the most pressing issues facing our planet today. Rising temperatures, extreme weather events, and sea-level rise are threatening ecosystems worldwide.',
    imageUrl: 'https://images.pexels.com/photos/14751274/pexels-photo-14751274.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'climate change biodiversity',
    photographer: 'Pexels',
    photographerUrl: 'https://www.pexels.com',
    views: 2500,
    likes: 780,
    shares: 150,
    status: 'published',
    lastUpdated: '2024-05-18T14:30:00Z',
  },
  {
    id: 3,
    slug: 'benefits-of-sustainable-business',
    title: 'The Benefits of Sustainable Business Practices',
    summary: 'Sustainability has become an increasingly important issue for businesses in recent years. Adopting sustainable practices is not just good for the environment, it’s good for business.',
    imageUrl: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'sustainable business',
    photographer: 'Jopwell',
    photographerUrl: 'https://www.pexels.com/@jopwell/',
    views: 850,
    likes: 210,
    shares: 45,
    status: 'draft',
    lastUpdated: '2024-05-21T09:00:00Z',
  },
   {
    id: 4,
    slug: 'the-psychology-of-color-in-marketing',
    title: 'The Psychology of Color in Marketing',
    summary: 'Discover how different colors influence consumer behavior and how you can use this knowledge to create more effective marketing campaigns.',
    imageUrl: 'https://images.pexels.com/photos/399161/pexels-photo-399161.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'color marketing psychology',
    photographer: 'Designecologist',
    photographerUrl: 'https://www.pexels.com/@designecologist/',
    views: 3100,
    likes: 950,
    shares: 220,
    status: 'published',
    lastUpdated: '2024-05-15T11:00:00Z',
  },
  {
    id: 5,
    slug: 'a-guide-to-minimalist-wardrobe-palettes',
    title: 'A Guide to Minimalist Wardrobe Palettes',
    summary: 'Learn how to build a stylish and versatile wardrobe with a limited color palette. Simplify your life and always look put-together.',
    imageUrl: 'https://images.pexels.com/photos/10404244/pexels-photo-10404244.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'minimalist wardrobe',
    photographer: 'Lana Fashion',
    photographerUrl: 'https://www.pexels.com/@lana-fashion-102575258/',
    views: 1800,
    likes: 560,
    shares: 110,
    status: 'private',
    lastUpdated: '2024-05-12T18:00:00Z',
  },
  {
    id: 6,
    slug: 'how-interior-colors-affect-your-mood',
    title: 'How Interior Colors Can Affect Your Mood',
    summary: 'The colors you choose for your home can have a significant impact on your emotions and well-being. Find the perfect shades for a happy home.',
    imageUrl: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'interior design colors',
    photographer: 'Veejay Villafranca',
    photographerUrl: 'https://www.pexels.com/@veejay-villafranca-75573/',
    views: 1500,
    likes: 420,
    shares: 95,
    status: 'password-protected',
    lastUpdated: '2024-05-10T16:45:00Z',
  },
  {
    id: 7,
    slug: 'figerout-in-daily-life',
    title: 'Beyond Design: Fun and Practical Ways to Use Figerout Every Day',
    summary: 'Discover how Figerout can brighten your daily tasks and bring a new level of fun to your routines. From matching your outfit to planning a party, learn how capturing colors can make the mundane magical.',
    imageUrl: 'https://images.pexels.com/photos/7973302/pexels-photo-7973302.jpeg?auto=compress&cs=tinysrgb&h=400&w=600&fit=crop',
    imageHint: 'colorful daily life',
    photographer: 'Liza Summer',
    photographerUrl: 'https://www.pexels.com/@liza-summer/',
    views: 980,
    likes: 250,
    shares: 60,
    status: 'published',
    lastUpdated: '2024-05-22T12:00:00Z',
  },
];
