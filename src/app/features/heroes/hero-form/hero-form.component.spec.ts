import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { HeroFormComponent } from './hero-form.component';
import { HeroService } from '../../../core/services/hero.service';
import { Hero, Universe } from '../../../models/hero.model';

const mockHero: Hero = {
  id: '1',
  name: 'Peter Parker',
  heroName: 'Spider-Man',
  power: 'Trepar paredes',
  universe: Universe.MARVEL,
};

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let router: Router;

  async function crearComponente(id: string | null = null) {
    heroService = jasmine.createSpyObj('HeroService', ['getById', 'create', 'update', 'generateId']);
    heroService.getById.and.returnValue(of(mockHero));
    heroService.create.and.returnValue(of(mockHero));
    heroService.update.and.returnValue(of(mockHero));
    heroService.generateId.and.returnValue('uuid-fake');

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: HeroService, useValue: heroService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('modo creacion', () => {
    beforeEach(async () => crearComponente(null));

    it('deberia crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('deberia poner el titulo Nuevo Heroe', () => {
      const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
      expect(h1.textContent).toContain('Nuevo Héroe');
    });

    it('el formulario debe estar invalido si esta vacio', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('no deberia llamar a create si el form no es valido', () => {
      component.onSubmit();
      expect(heroService.create).not.toHaveBeenCalled();
    });

    it('deberia llamar a create y redirigir al guardar', fakeAsync(() => {
      component.form.setValue({ id: '', name: 'Bruce Banner', heroName: 'HULK', power: 'Super fuerza', universe: Universe.MARVEL });
      component.onSubmit();
      tick();
      expect(heroService.create).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    }));

    it('deberia volver a la lista al cancelar', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('modo edicion', () => {
    beforeEach(async () => crearComponente('1'));

    it('deberia poner el titulo Editar Heroe', () => {
      const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
      expect(h1.textContent).toContain('Editar Héroe');
    });

    it('deberia cargar los datos del heroe', fakeAsync(() => {
      tick();
      fixture.detectChanges();
      expect(heroService.getById).toHaveBeenCalledWith('1');
      expect(component.form.get('name')?.value).toBe('Peter Parker');
    }));

    it('deberia llamar a update y no a create al guardar', fakeAsync(() => {
      tick();
      fixture.detectChanges();
      component.onSubmit();
      tick();
      expect(heroService.update).toHaveBeenCalled();
      expect(heroService.create).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    }));
  });
});
