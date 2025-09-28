// src/app/gallery/[id]/page.tsx
import DesignGuideClientPage from './client';

type PageProps = {
  params: { id: string };
};

// This page is now a simple wrapper.
// It extracts the design ID from params and passes it to the client component.
export default function DesignGuidePage({ params }: PageProps) {
  const { id } = params;
  return <DesignGuideClientPage designId={id} />;
}
