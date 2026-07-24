import { afterEach, describe, expect, it, vi } from "vitest";
import { api, setAccessTokenResolver } from "../lib/api/client";

afterEach(() => {
  setAccessTokenResolver(undefined);
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("adds the active session token to API requests", async () => {
    setAccessTokenResolver(async () => "session-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.get("/products", { page: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/products?page=1"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("surfaces the backend error-envelope message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: "Record is not accessible" } }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(api.get("/restricted")).rejects.toThrow("Record is not accessible");
  });
});
