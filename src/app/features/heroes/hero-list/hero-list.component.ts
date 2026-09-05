import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { HeroService } from '../../../core/services/hero.service';
import { Hero } from '../../../models/hero.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hero-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly heroes = signal<Hero[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly totalHeroes = signal(0);
  protected readonly displayedColumns = ['name', 'heroName', 'power', 'universe', 'actions'];
  protected readonly searchControl = new FormControl('');

  protected readonly pageSize = 3;
  protected readonly pageSizeOptions = [3, 5, 10, 15];

  protected readonly currentPage = signal(0);
  private currentPageSize = this.pageSize;

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalHeroes() / this.currentPageSize));
  }

  ngOnInit(): void {
    this.title.setTitle('Super Héroes');
    this.getHeroes();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.currentPage.set(0);
        this.isLoading.set(true);
      }),
      switchMap(term => this.heroService.search(term ?? '', 0, this.currentPageSize)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      this.heroes.set(result.data);
      this.totalHeroes.set(result.total);
      this.isLoading.set(false);
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.currentPageSize = event.pageSize;
    this.getHeroes(this.searchControl.value ?? '');
  }

  newHero(): void {
    this.router.navigate(['/heroes/new']);
  }

  editHero(id: string): void {
    this.router.navigate(['/heroes', id, 'edit']);
  }

  goToPage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const page = Number(input.value);
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page - 1);
      this.paginator.pageIndex = this.currentPage();
      this.getHeroes(this.searchControl.value ?? '');
    } else {
      input.value = String(this.currentPage() + 1);
    }
  }

  deleteHero(hero: Hero): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar héroe',
        message: `¿Estás seguro de que quieres eliminar a ${hero.heroName}?`
      }
    }).afterClosed().pipe(
      filter(confirmed => confirmed === true),
      switchMap(() => {
        this.isLoading.set(true);
        return this.heroService.delete(hero.id);
      }),
    ).subscribe(() => {
      if (this.heroes().length === 1 && this.currentPage() > 0) {
        this.currentPage.update(p => p - 1);
        this.paginator.pageIndex = this.currentPage();
      }
      this.getHeroes(this.searchControl.value ?? '');
    });
  }

  private getHeroes(searchText = ''): void {
    this.isLoading.set(true);
    this.heroService.search(searchText, this.currentPage(), this.currentPageSize).subscribe(result => {
      this.heroes.set(result.data);
      this.totalHeroes.set(result.total);
      this.isLoading.set(false);
    });
  }
}
