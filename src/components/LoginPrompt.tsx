'use client';

import AuthButton from './AuthButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Lock } from 'lucide-react';

export default function LoginPrompt() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto text-center border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Junte-se à Comunidade
          </CardTitle>
          <CardDescription className="text-base">
            Crie, salve, edite ou copie as criações do Beadify ao se logar na
            plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthButton />
        </CardContent>
      </Card>
    </div>
  );
}
