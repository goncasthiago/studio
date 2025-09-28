'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { Design } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil, Copy } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import LoginPrompt from './LoginPrompt';
import { useState } from 'react';

type DesignActionsProps = {
  design: Design;
};

export default function DesignActions({ design }: DesignActionsProps) {
  const { user, loading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const handleCloneClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  if (showLoginPrompt) {
    return <LoginPrompt />;
  }

  const isOwner = user && user.uid === design.userId;

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-4">
      {isOwner && (
        <Button asChild className="flex-1">
          <Link href={`/create?edit=${design.id}`}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Link>
        </Button>
      )}

      {user ? (
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/create?clone=${design.id}`}>
            <Copy className="mr-2 h-4 w-4" /> Criar Novo a Partir Deste
          </Link>
        </Button>
      ) : (
        <Button variant="outline" className="flex-1" onClick={handleCloneClick}>
          <Copy className="mr-2 h-4 w-4" /> Criar Novo a Partir Deste
        </Button>
      )}
    </div>
  );
}
