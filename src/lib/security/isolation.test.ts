import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("tenant isolation contract", () => {
  it("server modules resolve tenant from the session, not from the client", () => {
    const files = [
      "src/lib/server/crm.ts",
      "src/lib/server/lost-money.ts",
      "src/lib/server/finance.ts",
      "src/lib/server/catalog.ts",
      "src/lib/server/pipeline.ts",
      "src/lib/server/dashboard.ts",
      "src/lib/server/session.ts",
    ];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      assert.match(src, /requireTenant\(|loadTenant\(/, `${file} must resolve tenant server-side`);
      assert.doesNotMatch(
        src,
        /validator\([^\)]*companyId/,
        `${file} must not accept companyId from the client validator`,
      );
    }
  });

  it("tenant mutations always filter by membership company_id", () => {
    const src = readFileSync("src/lib/server/crm.ts", "utf8");
    assert.match(src, /company_id = \$\{tenant\.companyId\}/);
    assert.match(src, /and company_id = \$\{tenant\.companyId\}/);
  });

  it("platform admin company status changes still require isPlatformAdmin", () => {
    const src = readFileSync("src/lib/server/ops.ts", "utf8");
    assert.match(src, /if \(!tenant\.isPlatformAdmin\)/);
    assert.match(src, /setCompanyStatus/);
  });
});
