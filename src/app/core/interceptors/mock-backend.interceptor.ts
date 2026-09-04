import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Hero, PageResult } from '../../models/hero.model';
import { HeroStore } from '../services/hero.store';

const SIMULATED_DELAY = 500;
const API_BASE = '/api/heroes';

const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(HeroStore);
  const { url, method } = req;

  // GET /api/heroes
  if (url === API_BASE && method === 'GET') {
    const searchText = normalize((req.params.get('searchText') ?? '').trim());
    const page = Number(req.params.get('page') ?? 0);
    const pageSize = Number(req.params.get('pageSize') ?? 10);

    const heroes = store.getAll();
    const filtered = searchText
      ? heroes.filter((hero: Hero) =>
          normalize(hero.name).includes(searchText) ||
          normalize(hero.heroName).includes(searchText)
        )
      : heroes;
    const start = page * pageSize;
    const body: PageResult = { data: filtered.slice(start, start + pageSize), total: filtered.length };
    return of(new HttpResponse({ status: 200, body })).pipe(delay(SIMULATED_DELAY));
  }

  // GET /api/heroes/:id
  if (url.startsWith(`${API_BASE}/`) && method === 'GET') {
    const id = url.split('/').pop()!;
    const hero = store.findById(id) ?? null;
    return of(new HttpResponse({ status: 200, body: hero })).pipe(delay(SIMULATED_DELAY));
  }

  // POST /api/heroes
  if (url === API_BASE && method === 'POST') {
    const hero = req.body as Hero;
    store.add(hero);
    return of(new HttpResponse({ status: 201, body: hero })).pipe(delay(SIMULATED_DELAY));
  }

  // PUT /api/heroes/:id
  if (url.startsWith(`${API_BASE}/`) && method === 'PUT') {
    const hero = req.body as Hero;
    store.replace(hero);
    return of(new HttpResponse({ status: 200, body: hero })).pipe(delay(SIMULATED_DELAY));
  }

  // DELETE /api/heroes/:id
  if (url.startsWith(`${API_BASE}/`) && method === 'DELETE') {
    const id = url.split('/').pop()!;
    store.remove(id);
    return of(new HttpResponse({ status: 204, body: null })).pipe(delay(SIMULATED_DELAY));
  }

  return next(req);
};
