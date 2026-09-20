import { expect, test } from "@playwright/test";

test.describe("ユーザー一覧", () => {
  test("初期画面を表示する", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Users NgRx Sample");
    await expect(page.getByRole("heading", { name: "ユーザー一覧" })).toBeVisible();
    await expect(page.getByRole("button", { name: "ユーザーを取得" })).toBeEnabled();
    await expect(
      page.getByText("ボタンを押すと、Action から Store 保存までの流れが動きます。"),
    ).toBeVisible();
  });

  test("ユーザーを取得して一覧表示する", async ({ page }) => {
    await page.route("**/api/users.json", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, name: "田中 太郎", email: "taro.tanaka@example.com" },
          { id: 2, name: "佐藤 花子", email: "hanako.sato@example.com" },
        ]),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "ユーザーを取得" }).click();

    await expect(page.getByRole("button", { name: "読み込み中..." })).toBeDisabled();
    await expect(page.getByRole("list")).toBeVisible();
    await expect(page.getByText("田中 太郎")).toBeVisible();
    await expect(page.getByText("taro.tanaka@example.com")).toBeVisible();
    await expect(page.getByText("佐藤 花子")).toBeVisible();
    await expect(page.getByText("hanako.sato@example.com")).toBeVisible();
  });
});
