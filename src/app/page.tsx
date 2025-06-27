import WelcomeScreen from '@/components/welcome-screen';
import SharedColorPage from '@/components/shared-color-page';
import { Suspense } from 'react';

// Use Suspense to handle the server-side check for searchParams
function PageContent({ color }: { color?: string }) {
  if (color) {
    // Validate hex color format
    const isValidColor = /^([0-9A-F]{3}){1,2}$/i.test(color);
    if (isValidColor) {
      return <SharedColorPage color={`#${color}`} />;
    }
  }

  return <WelcomeScreen />;
}

export default async function HomePage({ searchParams }: { searchParams?: { color?: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent color={searchParams?.color} />
    </Suspense>
  );
}
