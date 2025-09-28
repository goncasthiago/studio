import type { Trophy } from './types';

export const ALL_TROPHIES: Trophy[] = [
  {
    id: 'login-1',
    name: 'Aqui estou!',
    description: 'Logar no site com sua conta Google',
    criteria: { type: 'login', count: 1 },
  },
  {
    id: 'create-1',
    name: 'Começando com as bolinhas',
    description: 'Criar seu primeiro Design',
    criteria: { type: 'create', count: 1 },
  },
  {
    id: 'create-5',
    name: 'Aquecendo minha criação',
    description: 'Criar 05 Designs',
    criteria: { type: 'create', count: 5 },
  },
  {
    id: 'create-10',
    name: 'Ninguém me segura!',
    description: 'Criar 10 Designs',
    criteria: { type: 'create', count: 10 },
  },
  {
    id: 'create-50',
    name: 'Ninguém me alcança',
    description: 'Criar 50 Designs',
    criteria: { type: 'create', count: 50 },
  },
  {
    id: 'like-5',
    name: 'Tô gostando',
    description: 'Curtir 05 designs',
    criteria: { type: 'like', count: 5 },
  },
  {
    id: 'like-10',
    name: 'Muita coisa boa',
    description: 'Curtir 10 Designs',
    criteria: { type: 'like', count: 10 },
  },
  {
    id: 'like-100',
    name: 'Pessoal tá inspirado!',
    description: 'Curtir 100 Designs',
    criteria: { type: 'like', count: 100 },
  },
  {
    id: 'favorite-4',
    name: 'Peças incríveis',
    description: 'Favoritar 04 Designs',
    criteria: { type: 'favorite', count: 4 },
  },
  {
    id: 'favorite-10',
    name: 'Crème de la crème',
    description: 'Favoritar 10 Designs',
    criteria: { type: 'favorite', count: 10 },
  },
  {
    id: 'favorite-100',
    name: 'Na verdade eu conheço todo mundo!',
    description: 'Favoritar 100 Designs',
    criteria: { type: 'favorite', count: 100 },
  },
];
