import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { of } from 'rxjs';

import { HeroListComponent } from './hero-list.component';
import { HeroService } from '../../../core/services/hero.service';
import { Hero, Universe } from '../../../models/hero.model';

const heroes: Hero[] = [
  { id: '1', name: 'Peter Parker', heroName: 'Spider-Man', power: 'Trepar paredes', universe: Universe.MARVEL },
  { id: '2', name: 'Clark Kent', heroName: 'Superman', power: 'Super fuerza', universe: Universe.DC },
];

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: Router;

  beforeEach(async () => {
    heroService = jasmine.createSpyObj('HeroService', ['search', 'delete']);
    heroService.search.and.returnValue(of({ data: heroes, total: 2 }));
    heroService.delete.and.returnValue(of(undefined));

    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: HeroService, useValue: heroService },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('deberia llamar a search al inicio', () => {
    expect(heroService.search).toHaveBeenCalledWith('', 0, 3);
  });

  it('deberia mostrar los heroes en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(2);
  });

  it('deberia mostrar el spinner cuando isLoading es true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
  });

  it('deberia ocultar el spinner cuando carga termina', () => {
    component.isLoading.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('deberia ir a crear heroe nuevo', () => {
    fixture.nativeElement.querySelector('button[mat-flat-button]').click();
    expect(router.navigate).toHaveBeenCalledWith(['/heroes/new']);
  });

  it('deberia ir a editar al pulsar el boton de editar', () => {
    fixture.nativeElement.querySelector('button[mat-icon-button]').click();
    expect(router.navigate).toHaveBeenCalledWith(['/heroes', '1', 'edit']);
  });

  it('deberia abrir dialogo al pulsar borrar', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(false) } as never);
    fixture.nativeElement.querySelector('button[color="warn"]').click();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('deberia borrar el heroe si confirma en el dialogo', fakeAsync(() => {
    dialog.open.and.returnValue({ afterClosed: () => of(true) } as never);
    fixture.nativeElement.querySelector('button[color="warn"]').click();
    tick();
    expect(heroService.delete).toHaveBeenCalledWith('1');
    expect(heroService.search).toHaveBeenCalledTimes(2);
  }));

  it('no deberia borrar si cancela el dialogo', fakeAsync(() => {
    dialog.open.and.returnValue({ afterClosed: () => of(false) } as never);
    fixture.nativeElement.querySelector('button[color="warn"]').click();
    tick();
    expect(heroService.delete).not.toHaveBeenCalled();
  }));

  describe('goToPage', () => {
    beforeEach(() => {
      component.totalHeroes.set(10); // totalPages = ceil(10/3) = 4
      fixture.detectChanges();
    });

    it('debería llamar a search con la página indicada si el valor es válido', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#currentPage') as HTMLInputElement;
      input.value = '3';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(heroService.search).toHaveBeenCalledWith('', 2, 3);
    }));

    it('debería restaurar el input y no llamar a search si la página es menor a 1', fakeAsync(() => {
      const callsBefore = heroService.search.calls.count();
      const input = fixture.nativeElement.querySelector('#currentPage') as HTMLInputElement;
      input.value = '0';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(heroService.search.calls.count()).toBe(callsBefore);
      expect(input.value).toBe('1');
    }));

    it('debería restaurar el input y no llamar a search si la página supera el total', fakeAsync(() => {
      const callsBefore = heroService.search.calls.count();
      const input = fixture.nativeElement.querySelector('#currentPage') as HTMLInputElement;
      input.value = '99';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(heroService.search.calls.count()).toBe(callsBefore);
      expect(input.value).toBe('1');
    }));
  });

  describe('onPageChange', () => {
    it('debería llamar a search con la nueva página y nuevo tamaño', fakeAsync(() => {
      component.onPageChange({ pageIndex: 1, pageSize: 5, length: 10 } as PageEvent);
      tick();
      expect(heroService.search).toHaveBeenCalledWith('', 1, 5);
    }));
  });

  describe('borrar el único héroe de la última página', () => {
    it('debería retroceder a la página anterior y buscar desde la página correcta', fakeAsync(() => {
      heroService.search.and.returnValue(of({ data: [heroes[0]], total: 4 }));
      component.onPageChange({ pageIndex: 1, pageSize: 3, length: 4 } as PageEvent);
      tick();
      fixture.detectChanges();

      dialog.open.and.returnValue({ afterClosed: () => of(true) } as never);
      heroService.search.and.returnValue(of({ data: heroes, total: 3 }));
      fixture.nativeElement.querySelector('button[color="warn"]').click();
      tick();

      expect(heroService.search.calls.mostRecent().args).toEqual(['', 0, 3]);
    }));
  });
});
