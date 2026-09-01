import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { HeroService } from '../../../core/services/hero.service';
import { Hero } from '../../../models/hero.model';

@Component({
  selector: 'app-hero-list',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent implements OnInit {
  private readonly heroService = inject(HeroService);

  readonly heroes = signal<Hero[]>([]);
  readonly isLoading = signal(true);
  readonly displayedColumns = ['name', 'heroName', 'power', 'universe', 'actions'];
  readonly searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadHeroes();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(term => this.searchHeroes(term ?? ''));
  }

  private loadHeroes(): void {
    this.isLoading.set(true);
    this.heroService.getAll().subscribe(heroes => {
      this.heroes.set(heroes);
      this.isLoading.set(false);
    });
  }

  private searchHeroes(term: string): void {
    this.isLoading.set(true);
    this.heroService.search(term).subscribe(heroes => {
      this.heroes.set(heroes);
      this.isLoading.set(false);
    });
  }
}
