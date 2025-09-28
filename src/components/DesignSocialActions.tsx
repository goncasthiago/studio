'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Design } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Heart, Star, Loader2, Trophy } from 'lucide-react';
import { toggleLike, toggleFavorite } from '@/lib/design-store';
import { checkAndAwardTrophies } from '@/lib/trophy-manager';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type DesignSocialActionsProps = {
  design: Design;
  onUpdate: (designId: string) => void;
};

export default function DesignSocialActions({
  design,
  onUpdate,
}: DesignSocialActionsProps) {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(design.likedBy?.length || 0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);

  useEffect(() => {
    if (user) {
      setIsFavorited(design.favoritedBy?.includes(user.uid) || false);
      setIsLiked(design.likedBy?.includes(user.uid) || false);
    } else {
      setIsFavorited(false);
      setIsLiked(false);
    }
    setLikeCount(design.likedBy?.length || 0);
  }, [user, design]);

  const notifyNewTrophies = (unlockedTrophies: any[]) => {
    unlockedTrophies.forEach(trophy => {
      toast({
        title: (
          <span className="flex items-center gap-2 font-bold">
            <Trophy className="h-5 w-5 text-amber-400" />
            Troféu Desbloqueado!
          </span>
        ),
        description: `Você ganhou o troféu: "${trophy.name}"`,
      });
    });
  };

  const handleFavoriteClick = async () => {
    if (!user || loading) {
      toast({
        variant: 'destructive',
        title: 'Faça login',
        description: 'Você precisa estar logado para favoritar um design.',
      });
      return;
    }
    setIsFavoritePending(true);
    try {
      await toggleFavorite(design.id, user.uid);
      setIsFavorited(prev => !prev);
      onUpdate(design.id); // Refresh the gallery to re-sort

      const newTrophies = await checkAndAwardTrophies(user.uid);
      if (newTrophies.length > 0) {
          notifyNewTrophies(newTrophies);
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível favoritar o design.',
      });
    } finally {
      setIsFavoritePending(false);
    }
  };

 const handleLikeClick = async () => {
    if (!user || loading) {
      toast({
        variant: 'destructive',
        title: 'Faça login',
        description: 'Você precisa estar logado para curtir um design.',
      });
      return;
    }
    if (isLikePending) return;
    setIsLikePending(true);
    
    // Optimistic UI updates
    const currentlyLiked = isLiked;
    setIsLiked(prev => !prev);
    setLikeCount(prev => (currentlyLiked ? prev - 1 : prev + 1));
    
    try {
        await toggleLike(design.id, user.uid);
        onUpdate(design.id);
        
        const newTrophies = await checkAndAwardTrophies(user.uid);
        if (newTrophies.length > 0) {
            notifyNewTrophies(newTrophies);
        }
    } catch (error) {
        // Revert optimistic updates on error
        setIsLiked(currentlyLiked);
        setLikeCount(prev => (currentlyLiked ? prev + 1 : prev - 1));

        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível registrar sua curtida. Tente novamente.',
        });
    } finally {
        setIsLikePending(false);
    }
};


  return (
    <div className="w-full flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeClick}
        disabled={isLikePending || loading}
        className="flex items-center gap-2 text-muted-foreground hover:text-red-500"
      >
        {isLikePending ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
        )}
        <span>{likeCount}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavoriteClick}
        disabled={isFavoritePending || loading}
        className="text-muted-foreground hover:text-amber-500"
      >
        {isFavoritePending ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <Star className={cn('h-4 w-4', isFavorited && 'fill-amber-400 text-amber-500')} />
        )}
      </Button>
    </div>
  );
}
