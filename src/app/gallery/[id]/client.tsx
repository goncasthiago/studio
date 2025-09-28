'use client';

import DesignDisplay from '@/components/DesignDisplay';
import LoginPrompt from '@/components/LoginPrompt';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DesignGuideClientPage({ designId }: { designId: string }) {
  const { user, loading } = useAuth();

  // Show a skeleton loader while auth state is being determined
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <Skeleton className="h-24 w-1/2 max-w-lg" />
        </div>
      </div>
    );
  }

  // If not logged in after checking, show the login prompt
  if (!user) {
    return <LoginPrompt />;
  }

  // If logged in, show the design
  return <DesignDisplay designId={designId} />;
}
