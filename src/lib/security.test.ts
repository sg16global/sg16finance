import { beforeEach, describe, expect, it } from "vitest";
import {
  SESSION_COOKIE,
  clearSessionCookieHeader,
  createSessionToken,
  getSessionEmail,
  sessionCookieHeader,
  sha256Hex,
  timingSafeEqual,
} from "@/lib/security";

const TEST_SECRET = "test-session-secret-0123456789abcdef0123456789";

function requestWithCookie(cookie: string): Request {
  return new Request("https://sg16finance.com/api/test", { headers: { cookie } });
}

beforeEach(() => {
  process.env.SESSION_SECRET = TEST_SECRET;
});

describe("session token", () => {
  it("round-trips a verified email through the cookie", async () => {
    const token = await createSessionToken("user@example.com");
    const email = await getSessionEmail(requestWithCookie(`${SESSION_COOKIE}=${token}`));
    expect(email).toBe("user@example.com");
  });

  it("returns null without a cookie", async () => {
    expect(await getSessionEmail(requestWithCookie(""))).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken("user@example.com");
    const parts = token.split(".");
    parts[2] = parts[2].slice(0, -2) + (parts[2].endsWith("aa") ? "bb" : "aa");
    expect(await getSessionEmail(requestWithCookie(`${SESSION_COOKIE}=${parts.join(".")}`))).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await getSessionEmail(requestWithCookie(`${SESSION_COOKIE}=garbage`))).toBeNull();
    expect(await getSessionEmail(requestWithCookie(`${SESSION_COOKIE}=v1.only-one-part`))).toBeNull();
  });

  it("does not accept a token minted with a different secret", async () => {
    const token = await createSessionToken("user@example.com");
    process.env.SESSION_SECRET = "another-session-secret-0123456789abcdef012345";
    expect(await getSessionEmail(requestWithCookie(`${SESSION_COOKIE}=${token}`))).toBeNull();
  });
});

describe("cookie helpers", () => {
  it("sets the hardened session cookie flags", () => {
    const header = sessionCookieHeader("v1.abc.def");
    expect(header).toContain(`${SESSION_COOKIE}=v1.abc.def`);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Path=/");
  });

  it("clears with Max-Age=0", () => {
    expect(clearSessionCookieHeader()).toContain("Max-Age=0");
  });
});

describe("timingSafeEqual", () => {
  it("matches equal strings", () => {
    expect(timingSafeEqual("secret", "secret")).toBe(true);
  });

  it("rejects different strings and lengths", () => {
    expect(timingSafeEqual("secret", "secreT")).toBe(false);
    expect(timingSafeEqual("secret", "secrets")).toBe(false);
  });
});

describe("sha256Hex", () => {
  it("produces the known digest for 'abc'", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
