import { expect, test } from "@playwright/test";

test("books and checks in a synthetic patient", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER DEMO CLINIC" }).click();
  const alias = `E2E-${Date.now()}`;
  await page.getByPlaceholder("Patient B-207").fill(alias);
  const future = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  await page.locator('input[type="datetime-local"]').fill(future);
  await page.getByRole("button", { name: "BOOK APPOINTMENT" }).click();
  await expect(page.getByText(/Appointment booked/)).toBeVisible();
  await page.getByRole("button", { name: "Refresh queue" }).click();
  const card = page.locator("article").filter({ hasText: alias });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Check in" }).click();
  await expect(page.getByText(/recorded with an audit event/)).toBeVisible();
});
