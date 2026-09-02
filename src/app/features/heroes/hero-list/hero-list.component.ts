import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { HeroService } from '../../../core/services/hero.service';
import { Hero } from '../../../models/hero.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingService } from '../../../core/services/loading.service';

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
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly loadingService = inject(LoadingService);

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
      this.getHeroes(term ?? '');
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.getHeroes(this.searchControl.value ?? '');
  }

  newHero(): void {
    this.router.navigate(['/heroes/new']);
  }

  editHero(id: string): void {
    this.router.navigate(['/heroes', id, 'edit']);
  }

  deleteHero(hero: Hero): void {
    const message = '¿Estás seguro de que quieres eliminar a ' + hero.heroName;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar héroe',
        message: message
      },
    }).afterClosed().subscribe((modified: boolean) => {
      if (modified) {
        this.isLoading.set(true);
        this.heroService.delete(hero.id).subscribe(() => {
          this.getHeroes(this.searchControl.value ?? '');
        });
      }
    });
  }

  private loadHeroes(): void {
    this.getHeroes();
  }

  private getHeroes(term: string = ''): void {
    this.isLoading.set(true);
    this.loadingService.show();
    this.heroService.search(term, this.currentPage, this.currentPageSize).subscribe(result => {
      this.heroes.set(result.data);
      this.totalHeroes.set(result.total);
      this.isLoading.set(false);
      this.loadingService.hide();
    });
  }
}
