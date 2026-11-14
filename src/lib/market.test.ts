import { describe, expect, it } from "vitest";
import { marketDataFreshness, type MarketAsset } from "./market";

const asset = (updatedAt: Date) => ({ symbol: "TEST", updatedAt } as unknown as MarketAsset);

describe("marketDataFreshness", () => {
  it("reports recently ingested data as fresh", () => {
    const result = marketDataFreshness([asset(new Date(Date.now() - 60_000))]);
    expect(result.stale).toBe(false);
    expect(result.dataAsOf).toBeTruthy();
  });

  it("reports a frozen ingest as stale and keeps the REAL timestamp", () => {
    const old = new Date("2026-11-12T21:33:52.498Z");
    const result = marketDataFreshness([asset(old)]);
    expect(result.stale).toBe(true);
    expect(result.dataAsOf).toBe(old.toISOString());
  });

  it("uses the newest row and treats an empty table as stale", () => {
    const older = new Date("2026-11-12T21:00:00.000Z");
    const newer = new Date("2026-11-12T21:33:52.498Z");
    expect(marketDataFreshness([asset(older), asset(newer)]).dataAsOf).toBe(newer.toISOString());
    expect(marketDataFreshness([]).stale).toBe(true);
  });
});
