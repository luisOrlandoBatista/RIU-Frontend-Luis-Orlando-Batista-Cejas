import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
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
    expect(heroService.search).toHaveBeenCalledWith('', 0, 5);
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
});
