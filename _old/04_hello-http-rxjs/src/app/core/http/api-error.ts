import { HttpErrorResponse } from "@angular/common/http";

export function toApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return "予期しないエラーが発生しました。";
  }

  if (error.status === 404) {
    return "対象のデータが見つかりませんでした。";
  }

  if (error.status === 0) {
    return "サーバーに接続できませんでした。";
  }

  return `通信に失敗しました。(HTTP ${error.status})`;
}
