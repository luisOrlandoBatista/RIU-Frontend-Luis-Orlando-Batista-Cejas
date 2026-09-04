import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatProgressBarModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly loadingService = inject(LoadingService);
}
