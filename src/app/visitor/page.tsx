import SharedColorPage from '@/components/shared-color-page';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

export default async function VisitorPage({ searchParams }: { searchParams?: { color?: string } }) {
  const color = searchParams?.color;
  const isValidColor = color && /^([0-9A-F]{3}){1,2}$/i.test(color);

  if (!isValidColor) {
    redirect('/');
  }

  return (
    <Suspense fallback={<div className="flex h-svh w-full items-center justify-center bg-background"><p>Loading Color...</p></div>}>
      <SharedColorPage color={`#${color}`} />
    </Suspense>
  );
}
