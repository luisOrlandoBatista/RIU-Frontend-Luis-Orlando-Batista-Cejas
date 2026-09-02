import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Hero, PageResult, Universe } from '../../models/hero.model';
import { HeroService } from './hero.service';

const DELAY = 1000;
const PAGE = 0;
const PAGE_SIZE = 10;

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
  });

  describe('método getAll', () => {
    it('debería devolver la primera página de héroes con el total correcto', fakeAsync(() => {
      let result: PageResult | undefined;
      service.getAll(0, 5).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(5);
      expect(result?.total).toBe(6);
    }));

    it('debería devolver la segunda página con los héroes restantes', fakeAsync(() => {
      let result: PageResult | undefined;
      service.getAll(1, 5).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(1);
      expect(result?.total).toBe(6);
    }));

    it('debería devolver todos los héroes si el pageSize es mayor que el total', fakeAsync(() => {
      let result: PageResult | undefined;
      service.getAll(PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(6);
      expect(result?.total).toBe(6);
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
      let result: PageResult | undefined;
      service.search('', PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(6);
      expect(result?.total).toBe(6);
    }));

    it('debería filtrar por nombre real del héroe', fakeAsync(() => {
      let result: PageResult | undefined;
      service.search('peter', PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(1);
      expect(result?.data[0].heroName).toBe('Spider-Man');
    }));

    it('debería filtrar por nombre de superhéroe', fakeAsync(() => {
      let result: PageResult | undefined;
      service.search('man', PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.total).toBeGreaterThan(1);
    }));

    it('debería ser insensible a mayúsculas', fakeAsync(() => {
      let result: PageResult | undefined;
      service.search('CLARK', PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(1);
      expect(result?.data[0].heroName).toBe('Superman');
    }));

    it('debería devolver lista vacía si no hay coincidencias', fakeAsync(() => {
      let result: PageResult | undefined;
      service.search('zzznomatch', PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.total).toBe(0);
      expect(result?.data.length).toBe(0);
    }));

    it('debería paginar los resultados de búsqueda correctamente', fakeAsync(() => {
      let result: PageResult | undefined;
      service.search('man', 0, 2).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.data.length).toBe(2);
      expect(result?.total).toBeGreaterThan(2);
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

      let result: PageResult | undefined;
      service.getAll(PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.total).toBe(7);
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

      let result: PageResult | undefined;
      service.getAll(PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.total).toBe(6);
    }));
  });

  describe('método delete', () => {
    it('debería eliminar el héroe con el id 1', fakeAsync(() => {
      service.delete('1').subscribe();
      tick(DELAY);

      let result: PageResult | undefined;
      service.getAll(PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.total).toBe(5);
      expect(result?.data.find(h => h.id === '1')).toBeUndefined();
    }));

    it('no debería modificar la lista si el id no existe', fakeAsync(() => {
      service.delete('999').subscribe();
      tick(DELAY);

      let result: PageResult | undefined;
      service.getAll(PAGE, PAGE_SIZE).subscribe(r => (result = r));
      tick(DELAY);
      expect(result?.total).toBe(6);
    }));
  });
});
