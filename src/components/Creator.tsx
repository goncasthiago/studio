
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import Pegboard from './Pegboard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HAMA_COLORS } from '@/lib/colors';
import type { BeadPosition, Design } from '@/lib/types';
import {
  Download,
  Image as ImageIcon,
  Loader2,
  MoveHorizontal,
  MoveVertical,
  Palette,
  Pipette,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  Upload,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { getDesignById, addDesign, updateDesign } from '@/lib/design-store';
import { checkAndAwardTrophies } from '@/lib/trophy-manager';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const DEFAULT_GRID_SIZE = 16;
const GRID_SIZES = [8, 16, 32];
const DEFAULT_USER_IMAGE =
  'https://img.joomcdn.net/1674f8972340a621f297205b1a1f151cacb061a3_1024_1024.jpeg';

function CreatorContent() {
  const [beads, setBeads] = useState<BeadPosition[]>([]);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [designName, setDesignName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(
    HAMA_COLORS[0].hex
  );
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [overlayX, setOverlayX] = useState(0);
  const [overlayY, setOverlayY] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    const designIdToLoad = searchParams.get('edit') || searchParams.get('clone');
    const isEditMode = !!searchParams.get('edit');

    if (designIdToLoad) {
      const loadDesignForEditing = async () => {
        const designToLoad = await getDesignById(designIdToLoad);
        if (designToLoad) {
          if (isEditMode) {
            // Check for ownership only in edit mode
            if (designToLoad.userId !== user?.uid) {
              toast({
                variant: 'destructive',
                title: 'Não autorizado',
                description: 'Você não pode editar um design que não é seu.',
              });
              router.push('/');
              return;
            }
            setEditId(designToLoad.id);
            setDesignName(designToLoad.name);
          } else {
            // In clone mode, clear editId and name
            setEditId(null);
            setDesignName('');
            toast({
              title: 'Modelo Carregado',
              description:
                'Crie seu novo design a partir deste modelo e dê a ele um novo nome.',
            });
          }

          const newSize = designToLoad.grid.rows;
          setGridSize(newSize);
          setBeads(
            designToLoad.beads.filter(
              b => b.row < newSize && b.col < newSize
            )
          );
          setOverlayImage(
            designToLoad.imageUrl?.startsWith('data:')
              ? designToLoad.imageUrl
              : null
          );
          setGalleryImage(designToLoad.imageUrl || null);
        } else {
          toast({
            variant: 'destructive',
            title: 'Design não encontrado',
            description:
              'O design que você tentou carregar não foi encontrado.',
          });
          router.push('/create');
        }
      };

      if (!loading && user) {
        loadDesignForEditing();
      } else if (!loading && !user) {
        toast({
          variant: 'destructive',
          title: 'Não autenticado',
          description: 'Por favor, faça login para editar ou clonar um design.',
        });
        router.push('/');
      }
    }
  }, [searchParams, user, loading, router, toast]);

  const handleGridSizeChange = (newSize: number) => {
    if (gridSize === newSize) return;

    setGridSize(newSize);

    // Filter beads to keep only those within the new grid bounds
    if (beads.length > 0) {
      const newBeads = beads.filter(b => b.row < newSize && b.col < newSize);
      setBeads(newBeads);

      if (newBeads.length < beads.length) {
        toast({
          title: 'Grade Redimensionada',
          description:
            'Algumas beads foram removidas porque estavam fora dos novos limites.',
        });
      }
    }
  };

  const handlePegClick = (row: number, col: number) => {
    const existingBead = beads.find(b => b.row === row && b.col === col);

    if (isPickerMode) {
      if (existingBead) {
        setSelectedColor(existingBead.color);
        toast({
          title: `Cor Selecionada: ${existingBead.color}`,
          description:
            'A paleta foi atualizada com a cor da bead selecionada.',
        });
      }
      setIsPickerMode(false); // Turn off picker mode after selection
      return;
    }

    if (existingBead) {
      // If bead of the same color exists, remove it
      if (existingBead.color === selectedColor) {
        setBeads(prevBeads => prevBeads.filter(b => b !== existingBead));
      } else {
        // If bead of a different color exists, change its color
        setBeads(prevBeads =>
          prevBeads.map(b =>
            b === existingBead ? { ...b, color: selectedColor } : b
          )
        );
      }
    } else {
      // Add new bead
      setBeads(prevBeads => [
        ...prevBeads,
        { row, col, color: selectedColor },
      ]);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setOverlayImage(base64);
      toast({
        title: 'Imagem Carregada',
        description: 'Sua imagem está pronta para ser usada como guia.',
      });
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      toast({
        variant: 'destructive',
        title: 'Erro no Arquivo',
        description: 'Não foi possível ler o arquivo selecionado.',
      });
    };
    // Resetar input do arquivo
    event.target.value = '';
  };

  const handleGalleryImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setGalleryImage(reader.result as string);
      toast({
        title: 'Imagem da Galeria Pronta',
        description: 'Esta imagem será mostrada na galeria.',
      });
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Erro no Arquivo',
        description: 'Não foi possível ler o arquivo de imagem da galeria.',
      });
    };
    event.target.value = '';
  };

  const clearBoard = () => {
    setBeads([]);
    setOverlayImage(null);
    setGalleryImage(null);
    setZoom(1);
    setShowOverlay(true);
    setOverlayX(0);
    setOverlayY(0);
    setDesignName('');
    setEditId(null);
    setIsPickerMode(false);
    setGridSize(DEFAULT_GRID_SIZE);
    router.push('/create');
  };

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

  const saveDesign = async () => {
    if (!user || !profile) {
      toast({
        variant: 'destructive',
        title: 'Não autenticado',
        description: 'Por favor, faça login para salvar seu design.',
      });
      return;
    }

    if (beads.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Design Vazio',
        description: 'Adicione algumas beads ao seu design antes de salvar!',
      });
      return;
    }

    if (!designName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome Faltando',
        description:
          'Por favor, insira um nome para o seu design antes de salvar.',
      });
      return;
    }

    setIsSaving(true);
    toast({
      title: 'Salvando Design...',
      description: 'Sua criação está sendo salva na galeria.',
    });

    const colorCounts: Record<string, number> = {};
    beads.forEach(bead => {
      colorCounts[bead.color] = (colorCounts[bead.color] || 0) + 1;
    });

    const designData: Omit<Design, 'id' | 'createdAt'> = {
      name: designName,
      imageId:
        editId ||
        `${designName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      grid: { rows: gridSize, cols: gridSize },
      beads,
      colorCounts,
      imageUrl: galleryImage || overlayImage || DEFAULT_USER_IMAGE,
      imageHint:
        galleryImage || overlayImage ? 'user generated' : 'Design do usuário',
      userId: user.uid,
      creatorName: profile.nickname,
      likedBy: [],
      favoritedBy: [],
    };

    try {
      if (editId) {
        const originalDesign = await getDesignById(editId);
        // Preserve likes and favorites when updating
        const finalDesignData: Partial<Design> = {
          ...designData,
          likedBy: originalDesign?.likedBy || [],
          favoritedBy: originalDesign?.favoritedBy || [],
        };
        // Update existing design
        await updateDesign(editId, finalDesignData);
        toast({
          title: 'Design Atualizado!',
          description: `Seu design "${designName}" foi atualizado na galeria.`,
        });
        router.push(`/gallery/${editId}`);
      } else {
        // Add new design
        const newId = await addDesign(designData);
        toast({
          title: 'Design Salvo!',
          description: `Seu design "${designName}" foi adicionado à galeria.`,
        });
        // Check for trophies after saving
        const newTrophies = await checkAndAwardTrophies(user.uid);
        if (newTrophies.length > 0) {
          notifyNewTrophies(newTrophies);
        }
        router.push('/gallery');
      }
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Ocorreu um erro ao salvar o design. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const PaletteComponent = () => (
    <>
      <ScrollArea className="h-[calc(100vh-220px)] lg:h-[500px]">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 gap-2 justify-center p-4 lg:p-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsPickerMode(!isPickerMode)}
                  className={cn(
                    'w-10 h-10 lg:w-8 lg:h-8 rounded-full border-2 transition-all flex items-center justify-center bg-muted',
                    isPickerMode
                      ? 'border-primary ring-2 ring-primary scale-110'
                      : 'border-transparent'
                  )}
                  aria-label="Selecionar Cor (Conta-gotas)"
                >
                  <Pipette className="h-5 w-5 lg:h-4 lg:w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Selecionar Cor (Conta-gotas)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {HAMA_COLORS.map(color => (
            <TooltipProvider key={color.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setIsPickerMode(false);
                      setSelectedColor(color.hex);
                      setPaletteOpen(false); // Fecha a paleta ao selecionar
                    }}
                    className={cn(
                      'w-10 h-10 lg:w-8 lg:h-8 rounded-full border-2 transition-all',
                      !isPickerMode && selectedColor === color.hex
                        ? 'border-primary ring-2 ring-primary scale-110'
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
      <div className="space-y-4 border-t pt-6 mt-6 px-4 lg:px-0">
        <Label className="font-semibold flex items-center gap-2">
          Tamanho da Grade
        </Label>
        <RadioGroup
          value={gridSize.toString()}
          onValueChange={value => handleGridSizeChange(parseInt(value))}
        >
          {GRID_SIZES.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <RadioGroupItem value={size.toString()} id={`size-${size}`} />
              <Label htmlFor={`size-${size}`}>
                {size} x {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline mb-4">
          {editId ? 'Editar Design' : 'Crie Seu Design'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {editId
            ? 'Ajuste sua criação.'
            : 'Deixe sua criatividade fluir! Clique nos pinos para colocar as beads.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Botão flutuante para paleta móvel */}
        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <Sheet open={isPaletteOpen} onOpenChange={setPaletteOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full shadow-lg h-14 w-14">
                <Palette className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Paleta e Ferramentas</SheetTitle>
              </SheetHeader>
              <PaletteComponent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Paleta para Desktop */}
        <div className="hidden lg:block lg:col-span-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Paleta</CardTitle>
            </CardHeader>
            <CardContent>
              <PaletteComponent />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 lg:order-2 flex items-center justify-center">
          <Pegboard
            rows={gridSize}
            cols={gridSize}
            beads={beads}
            isInteractive={true}
            onPegClick={handlePegClick}
            overlayImage={showOverlay ? overlayImage || undefined : undefined}
            overlayScale={zoom}
            overlayX={overlayX}
            overlayY={overlayY}
            isPickerMode={isPickerMode}
          />
        </div>

        <div className="lg:col-span-3 lg:order-3">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label
                  htmlFor="design-name"
                  className="font-semibold flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Nome do Design
                </Label>
                <Input
                  id="design-name"
                  type="text"
                  placeholder="Minha Criação Incrível"
                  value={designName}
                  onChange={e => setDesignName(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-4 border-t pt-6">
                <Label
                  htmlFor="gallery-image-upload"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Upload className="h-4 w-4" />
                  Imagem da Galeria (Opcional)
                </Label>
                <Input
                  id="gallery-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageChange}
                  disabled={isProcessing || isSaving}
                  className="file:text-foreground"
                />
                {galleryImage && (
                  <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                    <img
                      src={galleryImage}
                      alt="Pré-visualização da Galeria"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-6">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 font-semibold"
                >
                  <ImageIcon className="h-4 w-4" />
                  Sobreposição de Imagem Guia
                </Label>
                <div className="space-y-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isProcessing || isSaving}
                    className="file:text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Envie uma imagem para traçar por cima.
                  </p>
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>

              {overlayImage && (
                <div className="space-y-4 border-t pt-6">
                  <Label className="flex items-center gap-2 font-semibold">
                    <ZoomIn className="h-4 w-4" />
                    Ajustar Sobreposição
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ZoomOut className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[zoom]}
                        onValueChange={value => setZoom(value[0])}
                        min={0.5}
                        max={2.5}
                        step={0.1}
                      />
                      <ZoomIn className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Zoom
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MoveHorizontal className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[overlayX]}
                        onValueChange={value => setOverlayX(value[0])}
                        min={-50}
                        max={50}
                        step={1}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Horizontal
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MoveVertical className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[overlayY]}
                        onValueChange={value => setOverlayY(value[0])}
                        min={-50}
                        max={50}
                        step={1}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Vertical
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="show-overlay-switch"
                      checked={showOverlay}
                      onCheckedChange={setShowOverlay}
                    />
                    <Label htmlFor="show-overlay-switch" className="text-sm">
                      Mostrar Imagem de Fundo
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-6 border-t">
                <Button
                  onClick={saveDesign}
                  disabled={isSaving || loading || !user || !profile}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isSaving
                    ? 'Salvando...'
                    : editId
                    ? 'Atualizar Design'
                    : 'Salvar Design'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearBoard}
                  disabled={isSaving}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Limpar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CreatorPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CreatorContent />
    </Suspense>
  );
}
