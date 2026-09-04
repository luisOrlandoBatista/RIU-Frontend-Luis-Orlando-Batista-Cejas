import { AfterViewInit, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appUppercase]',
})
export class UppercaseDirective implements AfterViewInit {
  private readonly element = inject(ElementRef<HTMLInputElement>);
  private readonly control = inject(NgControl, { optional: true });


  ngAfterViewInit(): void {
    const initial = this.element.nativeElement.value;
    if (initial && initial !== initial.toUpperCase()) {
      this.element.nativeElement.value = initial.toUpperCase();
      this.control?.control?.setValue(initial.toUpperCase(), { emitEvent: false });
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.element.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const upper = input.value.toUpperCase();
    input.value = upper;
    input.setSelectionRange(start, end);
    this.control?.control?.setValue(upper, { emitEvent: true });
  }
}
