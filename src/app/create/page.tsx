'use client';

import Creator from '@/components/Creator';
import LoginPrompt from '@/components/LoginPrompt';
import { useAuth } from '@/hooks/use-auth';

export default function CreatePage() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPrompt />;
  }

  return <Creator />;
}
