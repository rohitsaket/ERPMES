import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../lib/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("adds the active session token to API requests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url === "/api/auth/token") {
          return Promise.resolve(
            new Response(JSON.stringify({ token: "session-token" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ data: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }),
    );

    await api.get("/products", { page: 1 });

    expect(fetch).toHaveBeenCalledWith(
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
      vi.fn().mockImplementation((url: string) => {
        if (url === "/api/auth/token") {
          return Promise.resolve(
            new Response(JSON.stringify({ token: "test-token" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({ error: { message: "Record is not accessible" } }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          ),
        );
      }),
    );

    await expect(api.get("/restricted")).rejects.toThrow("Record is not accessible");
  });
});
