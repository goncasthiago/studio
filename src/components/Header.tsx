import Link from 'next/link';
import AuthButton from './AuthButton';
import BeadsLogo from './BeadsLogo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BeadsLogo className="h-8" />
            <span className="font-bold sm:inline-block text-primary-foreground">Beadify</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/gallery"
              className="text-primary-foreground/60 transition-colors hover:text-primary-foreground/80"
            >
              Galeria
            </Link>
            <Link
              href="/create"
              className="text-primary-foreground/60 transition-colors hover:text-primary-foreground/80"
            >
              Criação
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
