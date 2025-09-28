"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { Loader2, Trophy } from 'lucide-react';
import { createUserProfile, getUserProfile } from '@/lib/user-store';
import type { Profile } from '@/lib/types';
import { useToast } from './use-toast';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is a new login which might unlock a trophy
    const isNewLogin = !sessionStorage.getItem('authProcessed');
  
    getRedirectResult(auth)
      .catch((error) => {
        console.error('AuthProvider: Erro em getRedirectResult:', error);
      });
      
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        let userProfile = await getUserProfile(userAuth.uid);
        let isNewUser = false;

        // If user logs in but doesn't have a profile (e.g., from a previous version),
        // or is genuinely a new user.
        if (!userProfile) {
          isNewUser = true;
          userProfile = await createUserProfile(userAuth);
        }

        setUser(userAuth);
        setProfile(userProfile);
        
        // If this is a new user OR the first login of a session,
        // and the user has the login trophy unlocked, show the toast.
        // This avoids showing the toast on every page load/refresh.
        if ((isNewUser || isNewLogin) && userProfile.unlockedTrophies?.includes('login-1')) {
           toast({
              title: (
                <span className="flex items-center gap-2 font-bold">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Troféu Desbloqueado!
                </span>
              ),
              description: 'Você ganhou o troféu: "Aqui estou!"',
            });
            // Mark that the auth process for this session has been handled
            sessionStorage.setItem('authProcessed', 'true');
        }

      } else {
        setUser(null);
        setProfile(null);
        // Clear the session flag on logout
        sessionStorage.removeItem('authProcessed');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Autenticando...</p>
        </div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
