import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HeroService } from '../../../core/services/hero.service';
import { Hero } from '../../../models/hero.model';

@Component({
  selector: 'app-hero-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent implements OnInit {
  private readonly heroService = inject(HeroService);

  readonly heroes = signal<Hero[]>([]);
  readonly isLoading = signal(true);
  readonly displayedColumns = ['name', 'heroName', 'power', 'universe', 'actions'];

  ngOnInit(): void {
    this.loadHeroes();
  }

  private loadHeroes(): void {
    this.isLoading.set(true);
    this.heroService.getAll().subscribe(heroes => {
      this.heroes.set(heroes);
      this.isLoading.set(false);
    });
  }
}
