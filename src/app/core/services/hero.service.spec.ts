import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Hero, Universe } from '../../models/hero.model';
import { HeroService } from './hero.service';

const DELAY = 1000;

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
  });

  describe('método getAll', () => {
    it('debería devolver todos los héroes iniciales', fakeAsync(() => {
      let heroes: Hero[] = [];
      service.getAll().subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(6);
    }));
  });

  describe('método getById', () => {
    it('debería devolver el héroe con el id indicado', fakeAsync(() => {
      let hero: Hero | undefined;
      service.getById('1').subscribe(result => (hero = result));
      tick(DELAY);
      expect(hero).toBeDefined();
      expect(hero?.heroName).toBe('Spider-Man');
    }));

    it('debería devolver undefined si el id no existe', fakeAsync(() => {
      let hero: Hero | undefined;
      service.getById('999').subscribe(result => (hero = result));
      tick(DELAY);
      expect(hero).toBeUndefined();
    }));
  });

  describe('método search', () => {
    it('debería devolver todos los héroes si el término está vacío', fakeAsync(() => {
      let heroes: Hero[] = [];
      service.search('').subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(6);
    }));

    it('debería filtrar por nombre real del héroe', fakeAsync(() => {
      let heroes: Hero[] = [];
      service.search('peter').subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(1);
      expect(heroes[0].heroName).toBe('Spider-Man');
    }));

    it('debería filtrar por nombre de superhéroe', fakeAsync(() => {
      let heroes: Hero[] = [];
      service.search('man').subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBeGreaterThan(1);
    }));

    it('debería ser insensible a mayúsculas', fakeAsync(() => {
      let heroes: Hero[] = [];
      service.search('CLARK').subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(1);
      expect(heroes[0].heroName).toBe('Superman');
    }));

    it('debería devolver lista vacía si no hay coincidencias', fakeAsync(() => {
      let heroes: Hero[] = [];
      service.search('zzznomatch').subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(0);
    }));
  });

  describe('método create', () => {
    it('debería añadir un nuevo héroe a la lista', fakeAsync(() => {
      const data: Hero = {
        id: '',
        name: 'Bruce Banner',
        heroName: 'Hulk',
        power: 'Super fuerza ilimitada',
        universe: Universe.MARVEL,
      };

      let created: Hero | undefined;
      service.create(data).subscribe(result => (created = result));
      tick(DELAY);

      expect(created).toBeDefined();
      expect(created?.id).toBeTruthy();

      let heroes: Hero[] = [];
      service.getAll().subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(7);
    }));

    it('debería asignar un id único generado, ignorando el id del parámetro', fakeAsync(() => {
      const data: Hero = {
        id: 'id-manual',
        name: 'Wanda Maximoff',
        heroName: 'Scarlet Witch',
        power: 'Magia',
        universe: Universe.MARVEL,
      };

      let created: Hero | undefined;
      service.create(data).subscribe(result => (created = result));
      tick(DELAY);
      expect(created?.id).not.toBe('id-manual');
    }));
  });

  describe('método update', () => {
    it('debería actualizar los datos del héroe existente', fakeAsync(() => {
      let original: Hero | undefined;
      service.getById('1').subscribe(result => (original = result));
      tick(DELAY);

      const updated: Hero = { ...original!, power: 'Sentido de araña mejorado' };
      service.update(updated).subscribe();
      tick(DELAY);

      let after: Hero | undefined;
      service.getById('1').subscribe(result => (after = result));
      tick(DELAY);
      expect(after?.power).toBe('Sentido de araña mejorado');
    }));

    it('no debería modificar el número total de héroes', fakeAsync(() => {
      let hero: Hero | undefined;
      service.getById('2').subscribe(result => (hero = result));
      tick(DELAY);

      service.update({ ...hero!, heroName: 'Super-Man' }).subscribe();
      tick(DELAY);

      let heroes: Hero[] = [];
      service.getAll().subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(6);
    }));
  });

  describe('método delete', () => {
    it('debería eliminar el héroe con el id 1', fakeAsync(() => {
      service.delete('1').subscribe();
      tick(DELAY);

      let heroes: Hero[] = [];
      service.getAll().subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(5);
      expect(heroes.find(h => h.id === '1')).toBeUndefined();
    }));

    it('no debería modificar la lista si el id no existe', fakeAsync(() => {
      service.delete('999').subscribe();
      tick(DELAY);

      let heroes: Hero[] = [];
      service.getAll().subscribe(result => (heroes = result));
      tick(DELAY);
      expect(heroes.length).toBe(6);
    }));
  });
});
