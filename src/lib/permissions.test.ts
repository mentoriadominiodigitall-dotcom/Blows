import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasPermission, permissionsForRole } from "./permissions.ts";

describe("RBAC", () => {
  it("owner has every permission", () => {
    assert.equal(hasPermission("owner", "billing.manage"), true);
    assert.equal(hasPermission("owner", "finance.write"), true);
  });

  it("seller cannot write finance", () => {
    assert.equal(hasPermission("seller", "finance.write"), false);
    assert.equal(hasPermission("seller", "customers.write"), true);
  });

  it("finance cannot write customers", () => {
    assert.equal(hasPermission("finance", "customers.write"), false);
    assert.equal(hasPermission("finance", "finance.write"), true);
  });

  it("attendant is least privilege", () => {
    const perms = permissionsForRole("attendant");
    assert.equal(perms.has("billing.manage"), false);
    assert.equal(perms.has("finance.write"), false);
    assert.equal(perms.has("customers.read"), true);
  });

  it("company override can revoke a manager permission", () => {
    assert.equal(
      hasPermission("manager", "campaigns.write", [
        { permission_slug: "campaigns.write", allowed: false },
      ]),
      false,
    );
  });
});
