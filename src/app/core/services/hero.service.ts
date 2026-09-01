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
}
