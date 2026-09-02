import { AfterViewInit, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appUppercase]',
})
export class UppercaseDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly control = inject(NgControl, { optional: true });


  ngAfterViewInit(): void {
    const initial = this.el.nativeElement.value;
    if (initial && initial !== initial.toUpperCase()) {
      this.el.nativeElement.value = initial.toUpperCase();
      this.control?.control?.setValue(initial.toUpperCase(), { emitEvent: false });
    }
  }

  @HostListener('input')
  onInput(): void {
    const upper = this.el.nativeElement.value.toUpperCase();
    this.el.nativeElement.value = upper;
    this.control?.control?.setValue(upper, { emitEvent: true });
  }
}
