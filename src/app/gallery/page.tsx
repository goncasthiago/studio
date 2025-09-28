
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getDesigns } from '@/lib/design-store';
import { useAuth } from '@/hooks/use-auth';
import type { Design } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';
import DesignSocialActions from '@/components/DesignSocialActions';
import LoginPrompt from '@/components/LoginPrompt';

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full flex flex-col">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <div className="aspect-square relative w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    const fetchedDesigns = await getDesigns();
    setDesigns(fetchedDesigns);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);
  
  const sortedDesigns = useMemo(() => {
    if (!designs.length) return [];
    
    return [...designs].sort((a, b) => {
      const aIsFavorited = user && a.favoritedBy?.includes(user.uid);
      const bIsFavorited = user && b.favoritedBy?.includes(user.uid);

      if (aIsFavorited && !bIsFavorited) return -1;
      if (!aIsFavorited && bIsFavorited) return 1;
      
      // If both have same favorite status, sort by creation time (already sorted by query)
      return 0;
    });
  }, [designs, user]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline mb-4">
          Galeria da Comunidade
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Navegue pela coleção de beads da comunidade. Clique em um card para
          ver o guia de montagem.
        </p>
      </div>

      {!user && <LoginPrompt />}

      {loading ? (
        <GallerySkeleton />
      ) : sortedDesigns.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">A galeria está vazia</h2>
          <p className="text-muted-foreground">
            Seja o primeiro a criar uma obra de arte! Vá para a página{' '}
            <Link href="/create" className="text-primary underline">
              Criação
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedDesigns.map(design => (
            <Card
              key={design.id}
              className="overflow-hidden transition-all duration-300 flex flex-col group"
            >
              <CardHeader>
                <CardTitle>{design.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                  <User className="h-3 w-3" />{' '}
                  {design.creatorName || 'Usuário Anônimo'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center p-0">
                <Link
                  href={`/gallery/${design.id}`}
                  className="w-full aspect-square relative"
                >
                  {design.imageUrl && (
                    <Image
                      src={design.imageUrl}
                      alt={`Pré-visualização de ${design.name}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={design.imageHint || 'pixel art'}
                      unoptimized={
                        typeof design.imageUrl === 'string' &&
                        design.imageUrl.startsWith('data:')
                      }
                    />
                  )}
                </Link>
              </CardContent>
              <CardFooter className="p-2">
                <DesignSocialActions
                  design={design}
                  onUpdate={fetchDesigns}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
