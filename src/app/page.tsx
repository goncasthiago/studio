'use client';
import Link from 'next/link';
import {
  ArrowRight,
  Brush,
  GalleryHorizontal,
  Wrench,
  Copy,
  Ruler,
  Pipette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-16">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline mb-4 tracking-tight">
          Dê Vida à Sua Arte Pixel com Beads
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          Beadify é a sua ferramenta criativa para desenhar, compartilhar e
          construir incríveis designs de bead art (Hama beads). Solte sua
          imaginação, crie guias de montagem e explore uma galeria cheia de
          inspiração.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/create">
              Comece a Criar Agora <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/gallery">
              Explorar a Galeria <GalleryHorizontal className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* How it works Section */}
      <div className="py-12 md:py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">
          Como Funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full h-16 w-16 mb-4">
              <Brush className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Crie e Edite</h3>
            <p className="text-muted-foreground">
              Use nosso editor para desenhar ou edite suas criações salvas a
              qualquer momento. Solte sua imaginação em uma tela digital.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full h-16 w-16 mb-4">
              <Pipette className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Reutilize Cores</h3>
            <p className="text-muted-foreground">
              Esqueceu qual cor usou? Com o conta-gotas, basta clicar em uma
              Bead existente para selecionar a cor novamente e continuar seu
              trabalho.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full h-16 w-16 mb-4">
              <Ruler className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Escolha o Tamanho</h3>
            <p className="text-muted-foreground">
              Selecione o tamanho de pegboard ideal para o seu projeto. Comece
              pequeno com 8x8 ou crie algo grandioso em uma grade de 32x32.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full h-16 w-16 mb-4">
              <Copy className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              4. Crie a Partir de Modelos
            </h3>
            <p className="text-muted-foreground">
              Gostou de um design na galeria? Use-o como ponto de partida para
              sua própria criação e dê a ele seu toque pessoal.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full h-16 w-16 mb-4">
              <GalleryHorizontal className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              5. Compartilhe na Galeria
            </h3>
            <p className="text-muted-foreground">
              Salve seu design finalizado para que toda a comunidade possa ver,
              se inspirar e até mesmo usar como modelo para novas ideias.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full h-16 w-16 mb-4">
              <Wrench className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              6. Monte no Mundo Real
            </h3>
            <p className="text-muted-foreground">
              Cada design vem com uma lista de materiais detalhada, mostrando
              exatamente quantas Beads você precisará para montar sua arte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
