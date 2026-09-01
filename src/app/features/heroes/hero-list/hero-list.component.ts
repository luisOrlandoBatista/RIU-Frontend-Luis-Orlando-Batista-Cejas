import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
    MatPaginatorModule,
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
  readonly totalHeroes = signal(0);
  readonly displayedColumns = ['name', 'heroName', 'power', 'universe', 'actions'];
  readonly searchControl = new FormControl('');

  readonly pageSize = 5;
  readonly pageSizeOptions = [5, 10, 15, 20];

  private currentPage = 0;
  private currentPageSize = this.pageSize;

  ngOnInit(): void {
    this.loadHeroes();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(term => {
      this.currentPage = 0;
      this.fetchHeroes(term ?? '');
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.fetchHeroes(this.searchControl.value ?? '');
  }

  private loadHeroes(): void {
    this.fetchHeroes('');
  }

  private fetchHeroes(term: string): void {
    this.isLoading.set(true);
    this.heroService.search(term, this.currentPage, this.currentPageSize).subscribe(result => {
      this.heroes.set(result.data);
      this.totalHeroes.set(result.total);
      this.isLoading.set(false);
    });
  }
}
