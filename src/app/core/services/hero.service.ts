import { Injectable, signal } from '@angular/core';

import { Hero, Universe } from '../../models/hero.model';

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

  getAll(): Hero[] {
    return this.heroes();
  }

  getById(id: string): Hero | undefined {
    return this.heroes().find(hero => hero.id === id);
  }

  search(term: string): Hero[] {
    const text = term.trim().toLowerCase();
    if (!text) return this.heroes();
    return this.heroes().filter(hero => hero.name.toLowerCase().includes(text) || hero.heroName.toLowerCase().includes(text));
  }

  create(data: Hero): Hero {
    const newHero: Hero = { ...data, id: crypto.randomUUID() };
    this.heroes.update(current => [...current, newHero]);
    return newHero;
  }

  update(updated: Hero): Hero {
    this.heroes.update(current =>
      current.map(hero => hero.id === updated.id ? updated : hero)
    );
    return updated;
  }

  delete(id: string): void {
    this.heroes.update(current => current.filter(hero => hero.id !== id));
  }
}
