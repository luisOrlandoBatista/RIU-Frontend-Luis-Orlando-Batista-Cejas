import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { UppercaseDirective } from './uppercase.directive';

@Component({
  template: `<input appUppercase [formControl]="control">`,
  imports: [UppercaseDirective, ReactiveFormsModule],
})
class TestHostComponent {
  control = new FormControl('');
}

describe('UppercaseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  describe('al escribir (evento input)', () => {
    it('debería convertir texto en minúsculas a mayúsculas', () => {
      input.value = 'spider-man';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('SPIDER-MAN');
      expect(host.control.value).toBe('SPIDER-MAN');
    });

    it('debería mantener el texto que ya está en mayúsculas', () => {
      input.value = 'BATMAN';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('BATMAN');
      expect(host.control.value).toBe('BATMAN');
    });

    it('debería convertir texto mixto a mayúsculas', () => {
      input.value = 'Iron Man';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('IRON MAN');
      expect(host.control.value).toBe('IRON MAN');
    });

    it('debería mantener el valor vacío sin errores', () => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('');
      expect(host.control.value).toBe('');
    });
  });

  describe('al inicializar con valor previo (modo edición)', () => {
    it('debería convertir a mayúsculas un valor inicial en minúsculas', () => {
      host.control.setValue('wonder woman');
      fixture.detectChanges();

      // Simulamos que el input ya tiene valor cuando la directiva inicializa
      input.value = 'wonder woman';
      fixture.componentRef.injector
        .get(UppercaseDirective as never, null);

      // Disparamos ngAfterViewInit manualmente
      const directive = Object.assign(Object.create(UppercaseDirective.prototype), {
        element: { nativeElement: input },
        control: { control: host.control },
      });
      directive.ngAfterViewInit();

      expect(input.value).toBe('WONDER WOMAN');
      expect(host.control.value).toBe('WONDER WOMAN');
    });

    it('no debería modificar un valor inicial que ya está en mayúsculas', () => {
      input.value = 'SUPERMAN';
      const setValueSpy = spyOn(host.control, 'setValue').and.callThrough();

      const directive = Object.assign(Object.create(UppercaseDirective.prototype), {
        element: { nativeElement: input },
        control: { control: host.control },
      });
      directive.ngAfterViewInit();

      expect(input.value).toBe('SUPERMAN');
      expect(setValueSpy).not.toHaveBeenCalled();
    });

    it('no debería modificar un valor inicial vacío', () => {
      input.value = '';
      const setValueSpy = spyOn(host.control, 'setValue').and.callThrough();

      const directive = Object.assign(Object.create(UppercaseDirective.prototype), {
        element: { nativeElement: input },
        control: { control: host.control },
      });
      directive.ngAfterViewInit();

      expect(input.value).toBe('');
      expect(setValueSpy).not.toHaveBeenCalled();
    });
  });

  describe('posición del cursor al editar en medio del texto', () => {
    it('debería conservar la posición del cursor tras transformar a mayúsculas', () => {
      input.value = 'batman';
      input.setSelectionRange(3, 3);
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('BATMAN');
      expect(input.selectionStart).toBe(3);
      expect(input.selectionEnd).toBe(3);
    });

    it('debería conservar una selección parcial en medio del texto', () => {
      input.value = 'iron man';
      input.setSelectionRange(2, 5);
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('IRON MAN');
      expect(input.selectionStart).toBe(2);
      expect(input.selectionEnd).toBe(5);
    });
  });

  describe('sin FormControl asociado (sin reactive form)', () => {
    it('debería convertir a mayúsculas en el DOM sin lanzar error', () => {
      // La directiva inyecta NgControl como optional, por lo que puede ser null
      const nativeInput = document.createElement('input');
      nativeInput.value = 'captain america';

      const directive = Object.assign(Object.create(UppercaseDirective.prototype), {
        element: { nativeElement: nativeInput },
        control: null,
      });

      expect(() => directive.onInput()).not.toThrow();
      expect(nativeInput.value).toBe('CAPTAIN AMERICA');
    });
  });
});
