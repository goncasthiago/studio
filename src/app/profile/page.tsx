'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trophy } from 'lucide-react';
import { updateNickname } from '@/lib/user-store';
import { ALL_TROPHIES } from '@/lib/trophies';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { checkAndAwardTrophies } from '@/lib/trophy-manager';
import LoginPrompt from '@/components/LoginPrompt';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTrophies, setIsCheckingTrophies] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
    }
  }, [profile]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-2">Carregando perfil...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginPrompt />;
  }

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

  const handleTrophyCheck = async () => {
    if (!user || isCheckingTrophies) return;

    setIsCheckingTrophies(true);
    toast({
      title: 'Verificando troféus...',
      description: 'Aguarde um momento enquanto verificamos suas conquistas.',
    });

    try {
      const newTrophies = await checkAndAwardTrophies(user.uid);

      if (newTrophies.length > 0) {
        notifyNewTrophies(newTrophies);
        // We need to trigger a re-render to show the new trophies.
        // A full reload is one way, but ideally we'd re-fetch the profile.
        // For now, a reload is simple and effective.
        window.location.reload();
      } else {
        toast({
          title: 'Nenhum novo troféu',
          description: 'Continue criando e interagindo para desbloquear mais!',
        });
      }
    } catch (e) {
       toast({
        variant: 'destructive',
        title: 'Erro na Verificação',
        description: 'Não foi possível verificar seus troféus. Tente novamente.',
      });
    }


    setIsCheckingTrophies(false);
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    if (nickname.length < 3) {
      setError('O nickname deve ter pelo menos 3 caracteres.');
      return;
    }
    if (nickname === profile.nickname) {
       toast({
        title: 'Nenhuma alteração',
        description: 'O nickname não foi alterado.',
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await updateNickname(user.uid, nickname);

      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: result.message,
        });
        // Reload to reflect nickname change in the header
        window.location.reload();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    }


    setIsLoading(false);
  };
  
  const unlocked = profile.unlockedTrophies || [];
  const sortedTrophies = [...ALL_TROPHIES].sort((a, b) => {
    const aUnlocked = unlocked.includes(a.id);
    const bUnlocked = unlocked.includes(b.id);
    if (aUnlocked === bUnlocked) return 0;
    return aUnlocked ? -1 : 1;
  });

  return (
    <div className="container mx-auto py-8 px-4">
       <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline mb-4">
          Meu Perfil
        </h1>
        <p className="text-lg text-muted-foreground">
          Veja e edite suas informações de perfil e troféus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* User Info Card */}
        <div className="md:col-span-1">
          <Card>
             <CardHeader>
               <CardTitle>Informações</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome de Exibição</Label>
                  <Input value={profile.displayName} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <p className="text-xs text-muted-foreground">
                      Seu nome único na plataforma. Apenas letras minúsculas, sem espaços.
                    </p>
                </div>
             </CardContent>
             <CardFooter>
                <Button onClick={handleSave} disabled={isLoading || isCheckingTrophies} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
             </CardFooter>
          </Card>
        </div>

        {/* Trophies Card */}
        <div className="md:col-span-2">
           <Card>
             <CardHeader>
               <CardTitle>Meus Troféus</CardTitle>
               <CardDescription>Você desbloqueou {unlocked.length} de {ALL_TROPHIES.length} troféus. Clique em um troféu bloqueado para verificar seu progresso!</CardDescription>
             </CardHeader>
             <CardContent>
                <ScrollArea className="h-96 rounded-md border p-4">
                  <TooltipProvider>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {sortedTrophies.map(trophy => {
                         const isUnlocked = unlocked.includes(trophy.id);
                         return (
                          <Tooltip key={trophy.id} delayDuration={100}>
                            <TooltipTrigger asChild>
                               <button
                                  onClick={handleTrophyCheck}
                                  disabled={isCheckingTrophies}
                                  className={`relative flex items-center justify-center aspect-square p-2 rounded-lg transition-all ${isUnlocked ? 'bg-amber-100' : 'bg-muted hover:bg-muted/80'}`}
                                >
                                {isCheckingTrophies && (
                                  <Loader2 className="absolute h-6 w-6 animate-spin text-muted-foreground" />
                                )}
                                <Trophy className={`h-10 w-10 ${isUnlocked ? 'text-amber-500' : 'text-muted-foreground/50'} ${isCheckingTrophies ? 'opacity-20' : ''}`} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-bold">{trophy.name}</p>
                              <p className="text-sm text-muted-foreground">{trophy.description}</p>
                               {!isUnlocked && <p className="text-xs text-center font-semibold text-destructive mt-1">(Bloqueado - Clique para verificar)</p>}
                            </TooltipContent>
                          </Tooltip>
                         );
                      })}
                    </div>
                  </TooltipProvider>
                </ScrollArea>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
