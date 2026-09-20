import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
  selector: "app-error-banner",
  templateUrl: "./error-banner.html",
  styleUrl: "./error-banner.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorBanner {
  readonly message = input.required<string>();
  readonly retryable = input(false);
  readonly retry = output<void>();
}
