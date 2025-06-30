export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  imageHint: string;
  views: number;
  likes: number;
  shares: number;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'top-10-eco-friendly-products',
    title: 'Top 10 Eco-Friendly Products for Your Home',
    summary: 'As more and more people become aware of the impact that our lifestyles have on the environment, the demand for eco-friendly products is on the rise.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'eco friendly products',
    views: 1200,
    likes: 345,
    shares: 89,
  },
  {
    id: 2,
    slug: 'impact-of-climate-change',
    title: 'The Impact of Climate Change on Biodiversity',
    summary: 'Climate change is one of the most pressing issues facing our planet today. Rising temperatures, extreme weather events, and sea-level rise are threatening ecosystems worldwide.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'climate change biodiversity',
    views: 2500,
    likes: 780,
    shares: 150,
  },
  {
    id: 3,
    slug: 'benefits-of-sustainable-business',
    title: 'The Benefits of Sustainable Business Practices',
    summary: 'Sustainability has become an increasingly important issue for businesses in recent years. Adopting sustainable practices is not just good for the environment, it’s good for business.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'sustainable business',
    views: 850,
    likes: 210,
    shares: 45,
  },
   {
    id: 4,
    slug: 'the-psychology-of-color-in-marketing',
    title: 'The Psychology of Color in Marketing',
    summary: 'Discover how different colors influence consumer behavior and how you can use this knowledge to create more effective marketing campaigns.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'color marketing psychology',
    views: 3100,
    likes: 950,
    shares: 220,
  },
  {
    id: 5,
    slug: 'a-guide-to-minimalist-wardrobe-palettes',
    title: 'A Guide to Minimalist Wardrobe Palettes',
    summary: 'Learn how to build a stylish and versatile wardrobe with a limited color palette. Simplify your life and always look put-together.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'minimalist wardrobe',
    views: 1800,
    likes: 560,
    shares: 110,
  },
  {
    id: 6,
    slug: 'how-interior-colors-affect-your-mood',
    title: 'How Interior Colors Can Affect Your Mood',
    summary: 'The colors you choose for your home can have a significant impact on your emotions and well-being. Find the perfect shades for a happy home.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'interior design colors',
    views: 1500,
    likes: 420,
    shares: 95,
  },
];
