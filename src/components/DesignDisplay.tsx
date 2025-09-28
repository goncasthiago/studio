'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import type { Design } from '@/lib/types';
import { HAMA_COLORS } from '@/lib/colors';
import Pegboard from '@/components/Pegboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DesignActions from './DesignActions';
import { getDesignById } from '@/lib/design-store';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to find color name from hex
function getColorName(hex: string): string {
  const color = HAMA_COLORS.find(
    c => c.hex.toLowerCase() === hex.toLowerCase()
  );
  return color ? color.name : hex;
}

function DesignPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-12 w-1/2 mx-auto mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 lg:col-start-2 flex items-center justify-center">
          <Skeleton className="w-[min(90vw,80vh,700px)] h-[min(90vw,80vh,700px)]" />
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function DesignDisplay({ designId }: { designId: string }) {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesign() {
      if (!designId) return;
      try {
        setLoading(true);
        const fetchedDesign = await getDesignById(designId);
        if (fetchedDesign) {
          setDesign(fetchedDesign);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Failed to fetch design', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchDesign();
  }, [designId]);

  if (loading) {
    return <DesignPageSkeleton />;
  }

  if (!design) {
    return notFound();
  }

  const colorCounts = design.colorCounts || {};
  const totalBeads = Object.values(colorCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center font-headline">
        {design.name}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 lg:col-start-2 flex items-center justify-center">
          <Pegboard
            rows={design.grid.rows}
            cols={design.grid.cols}
            beads={design.beads}
            isInteractive={false}
          />
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Materiais Necessários</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {Object.entries(colorCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([hex, count]) => (
                    <li
                      key={hex}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{getColorName(hex)}</span>
                      </div>
                      <span className="font-semibold text-muted-foreground">
                        {count} beads
                      </span>
                    </li>
                  ))}
              </ul>
              <hr className="my-4" />
              <div className="flex justify-between font-bold">
                <span>Total de Beads</span>
                <span>{totalBeads}</span>
              </div>
            </CardContent>
          </Card>
          <DesignActions design={design} />
        </div>
      </div>
    </div>
  );
}
