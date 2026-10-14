import { describe, expect, it } from "vitest";
import { PLANS, isPlanKey, normalizeEmail, planFromProductId, productIdFor } from "@/lib/passes";

describe("normalizeEmail", () => {
  it("accepts and normalizes a valid email", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("rejects invalid or oversized values", () => {
    expect(normalizeEmail("not-an-email")).toBeNull();
    expect(normalizeEmail("a@b")).toBeNull();
    expect(normalizeEmail("a b@example.com")).toBeNull();
    expect(normalizeEmail("x".repeat(250) + "@example.com")).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });
});

describe("plan resolution", () => {
  it("recognises plan keys", () => {
    expect(isPlanKey("vip")).toBe(true);
    expect(isPlanKey("day5")).toBe(true);
    expect(isPlanKey("free")).toBe(false);
    expect(isPlanKey(undefined)).toBe(false);
  });

  it("resolves plans by product id", () => {
    expect(planFromProductId(PLANS.vip.testProductId)?.key).toBe("vip");
    expect(planFromProductId("pdt_unknown")).toBeUndefined();
    expect(planFromProductId(123)).toBeUndefined();
  });

  it("allows per-plan product id overrides", () => {
    const original = process.env.DODO_PRODUCT_VIP;
    try {
      process.env.DODO_PRODUCT_VIP = "pdt_live_override";
      expect(productIdFor(PLANS.vip)).toBe("pdt_live_override");
      expect(planFromProductId("pdt_live_override")?.key).toBe("vip");
    } finally {
      if (original === undefined) delete process.env.DODO_PRODUCT_VIP;
      else process.env.DODO_PRODUCT_VIP = original;
    }
  });
});
