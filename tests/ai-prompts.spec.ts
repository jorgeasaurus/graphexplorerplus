import { test, expect } from "@playwright/test";

const AI_PROMPTS = [
  "List users whose accounts are disabled",
  "Show users with admin roles",
  "Get all groups I'm a member of",
  "List all app registrations in my tenant",
  "List apps and their credential expiration dates",
  "Show guest users in my tenant",
  "Find users with no MFA registered",
  "Get all deleted users",
  "Get my direct reports",
  "List service principals and their credentials",
  "Show me all non-compliant devices",
  "Find devices running Windows 11",
  "Get all device configuration profiles",
  "Find Windows Autopilot devices",
  "Get all Intune PowerShell scripts",
  "List devices that haven't synced in 30 days",
  "Show all Intune app protection policies",
  "List all compliance policies",
  "Show corporate-owned devices",
  "List all assignment filters in Intune",
  "Show Settings Catalog policies",
  "Get all Conditional Access policies",
  "Show risky sign-ins from today",
  "List all security alerts",
  "Show risky users in my tenant",
  "List all named locations in Conditional Access",
  "Get all security incidents",
  "Show my recent Teams messages",
  "Show me my calendar events for this week",
  "Get all SharePoint sites",
  "List my recent emails",
  "Get my OneDrive recent files",
  "Show my Planner tasks",
  "Get Teams activity report for last 7 days",
];

test.describe("AI prefilled prompts", () => {
  for (const prompt of AI_PROMPTS) {
    test(`"${prompt}" generates a valid Graph API query`, async ({ page }) => {
      const aiResponses: { status: number; body: string }[] = [];
      page.on("response", (res) => {
        if (res.url().includes("/api/ai")) {
          void res.text().then((body) => {
            aiResponses.push({ status: res.status(), body });
          });
        }
      });

      await page.goto("http://localhost:3000/explorer", { waitUntil: "networkidle" });

      const aiInput = page.locator('input[aria-label="Describe your query in plain English"]');
      await expect(aiInput).toBeVisible({ timeout: 10_000 });

      // Open examples dropdown
      const examplesBtn = page.locator('button[aria-label="Show example queries"]');
      await examplesBtn.click();

      // Click the specific prompt
      const promptBtn = page.locator("button").filter({ hasText: prompt }).first();
      await expect(promptBtn).toBeVisible({ timeout: 5_000 });
      await promptBtn.click();

      // Verify prompt populated
      await expect(aiInput).toHaveValue(prompt);

      // Click Generate
      const generateBtn = page.locator("button", { hasText: "Generate" });
      await expect(generateBtn).toBeVisible({ timeout: 3_000 });
      await generateBtn.click();

      // Wait for Thinking indicator to appear then disappear
      const thinkingIndicator = page.locator("text=Thinking");
      await expect(thinkingIndicator).toBeVisible({ timeout: 5_000 });
      await expect(thinkingIndicator).not.toBeVisible({ timeout: 60_000 });

      // Check no error
      const errorMsg = page.locator("text=AI request failed");
      const hasError = await errorMsg.isVisible().catch(() => false);

      // Log result
      if (aiResponses.length > 0) {
        const last = aiResponses[aiResponses.length - 1]!;
        if (last.status === 200) {
          const parsed = JSON.parse(last.body) as { method: string; url: string };
          console.log(`✓ ${prompt}`);
          console.log(`  → ${parsed.method} ${parsed.url}`);
        } else {
          console.log(`✗ ${prompt} — HTTP ${last.status}`);
          console.log(`  → ${last.body.slice(0, 200)}`);
        }
      }

      expect(hasError, `AI request failed for: "${prompt}"`).toBe(false);
      expect(aiResponses.length, "Expected an AI API call").toBeGreaterThan(0);
      expect(aiResponses[aiResponses.length - 1]!.status, "AI should return 200").toBe(200);

      // Validate response
      const lastBody = JSON.parse(aiResponses[aiResponses.length - 1]!.body) as {
        method: string;
        url: string;
      };
      expect(lastBody.url).toContain("graph.microsoft.com");
      expect(["GET", "POST", "PATCH", "PUT", "DELETE"]).toContain(lastBody.method);

      // Verify no any()/all() in generated URL
      expect(lastBody.url).not.toMatch(/any\s*\(/i);
      expect(lastBody.url).not.toMatch(/all\s*\(/i);

      // Verify lowercase OData functions
      expect(lastBody.url).not.toContain("startsWith(");
      expect(lastBody.url).not.toContain("endsWith(");
      expect(lastBody.url).not.toContain("Contains(");
    });
  }
});
