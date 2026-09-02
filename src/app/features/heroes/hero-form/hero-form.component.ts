import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HeroService } from '../../../core/services/hero.service';
import { Hero, Universe } from '../../../models/hero.model';

@Component({
  selector: 'app-hero-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
})
export class HeroFormComponent {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  readonly universes = Object.values(Universe);

  readonly isSaving = signal(false);

  readonly form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    heroName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    power: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    universe: new FormControl(Universe.OTHER, { nonNullable: true, validators: Validators.required }),
  });

  get name() {
    return (this.form.get('name') as FormControl);
  }

  get heroName() {
    return (this.form.get('heroName') as FormControl);
  }

  get power() {
    return (this.form.get('power') as FormControl);
  }

  get universe() {
    return (this.form.get('universe') as FormControl);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const heroData: Hero = { ...this.form.getRawValue(), id: this.heroService.generateId()};
    this.heroService.create(heroData).subscribe(() => {
      this.isSaving.set(false);
      this.router.navigate(['/heroes']);
    });
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
