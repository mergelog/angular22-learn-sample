import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-spinner",
  templateUrl: "./spinner.html",
  styleUrl: "./spinner.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  readonly label = input("読み込み中…");
}
