import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import {Hero, PageResult, Universe} from '../../models/hero.model';

const SIMULATED_DELAY = 1000;

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly heroes = signal<Hero[]>([
    { id: '1', name: 'Peter Parker', heroName: 'Spider-Man', power: 'Trepar paredes', universe: Universe.MARVEL },
    { id: '2', name: 'Clark Kent', heroName: 'Superman', power: 'Super fuerza, vuela', universe: Universe.DC },
    { id: '3', name: 'Tony Stark', heroName: 'Iron Man', power: 'Armadura, tecnología', universe: Universe.MARVEL },
    { id: '4', name: 'Bruce Wayne', heroName: 'Batman', power: 'Buena condición física, murciélago', universe: Universe.DC },
    { id: '5', name: 'Steve Rogers', heroName: 'Captain America', power: 'Súper soldado', universe: Universe.MARVEL },
    { id: '6', name: 'Diana Prince', heroName: 'Wonder Woman', power: 'Fuerza sobrehumana, látigo de la verdad', universe: Universe.DC },
  ]);

  getAll(page: number, pageSize: number): Observable<PageResult> {
    const heroes = this.heroes();
    const start = page * pageSize;
    const data = heroes.slice(start, start + pageSize);
    return of({ data, total: heroes.length } as PageResult).pipe(delay(SIMULATED_DELAY));
  }

  getById(id: string): Observable<Hero | undefined> {
    return of(this.heroes().find(hero => hero.id === id)).pipe(delay(SIMULATED_DELAY));
  }

  search(term: string, page: number, pageSize: number): Observable<PageResult> {
    const text = term.trim().toLowerCase();
    const filtered = !text
      ? this.heroes()
      : this.heroes().filter(hero =>
          hero.name.toLowerCase().includes(text) ||
          hero.heroName.toLowerCase().includes(text)
        );
    const start = page * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return of({ data, total: filtered.length }).pipe(delay(SIMULATED_DELAY));
  }

  generateId(): string {
    return crypto.randomUUID();
  }

  create(data: Hero): Observable<Hero> {
    const newHero: Hero = { ...data, id: data.id ?? this.generateId() };
    this.heroes.update(current => [...current, newHero]);
    return of(newHero).pipe(delay(SIMULATED_DELAY));
  }

  update(updated: Hero): Observable<Hero> {
    this.heroes.update(current =>
      current.map(hero => hero.id === updated.id ? updated : hero)
    );
    return of(updated).pipe(delay(SIMULATED_DELAY));
  }

  delete(id: string): Observable<void> {
    this.heroes.update(current => current.filter(hero => hero.id !== id));
    return of(undefined).pipe(delay(SIMULATED_DELAY));
  }
}
