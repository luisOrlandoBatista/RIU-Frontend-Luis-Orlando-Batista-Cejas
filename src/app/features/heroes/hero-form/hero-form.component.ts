import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HeroService } from '../../../core/services/hero.service';
import { Hero, Universe } from '../../../models/hero.model';
import { UppercaseDirective } from '../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-hero-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    UppercaseDirective,
  ],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
})
export class HeroFormComponent implements OnInit {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);

  protected readonly universes = Object.values(Universe);
  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    heroName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    power: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    universe: new FormControl(Universe.OTHER, { nonNullable: true, validators: Validators.required }),
  });

  protected get name() {
    return this.form.get('name') as FormControl;
  }

  protected get heroName() {
    return this.form.get('heroName') as FormControl;
  }

  protected get power() {
    return this.form.get('power') as FormControl;
  }

  protected get universe() {
    return this.form.get('universe') as FormControl;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.title.setTitle(id ? 'Editar Héroe' : 'Nuevo Héroe');
    if (id) {
      this.isEditMode.set(true);
      this.isLoading.set(true);
      this.form.disable();

      this.heroService.getById(id).subscribe(hero => {
        this.isLoading.set(false);
        if (hero) {
          this.form.patchValue(hero);
          this.form.enable();
        } else {
          this.router.navigate(['/heroes']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSaving.set(true);
      const dataRawValue = this.form.getRawValue();
      const heroData: Hero = {
        ...dataRawValue,
        id: this.isEditMode() ? (dataRawValue.id ?? '') : this.heroService.generateId()
      };
      if (this.isEditMode()) {
        this.heroService.update(heroData).subscribe(() => {
          this.isSaving.set(false);
          this.router.navigate(['/heroes']);
        });
      } else {
        this.heroService.create(heroData).subscribe(() => {
          this.isSaving.set(false);
          this.router.navigate(['/heroes']);
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }
}
