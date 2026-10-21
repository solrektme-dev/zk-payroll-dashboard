import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generatePayrollProof, resetZkEngineForTests } from "@/lib/zk";

type FetchCall = {
  input: string;
  init?: RequestInit;
};

describe("generatePayrollProof", () => {
  let originalFetch: typeof fetch | undefined;
  let originalWindow: Window | undefined;
  let originalCrypto: Crypto | undefined;
  let fetchCalls: FetchCall[];

  beforeEach(() => {
    resetZkEngineForTests();
    fetchCalls = [];

    originalFetch = globalThis.fetch;
    originalWindow = globalThis.window;
    originalCrypto = globalThis.crypto;

    Object.defineProperty(globalThis, "window", {
      value: { crypto: webcrypto },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
      writable: true,
    });

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push({ input: String(input), init });
      return {
        ok: false,
        json: async () => ({}),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response;
    }) as typeof fetch;
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }

    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  });

  it("generates a mock proof and Soroban payload from generic public inputs", async () => {
    const result = await generatePayrollProof({
      merkleRoot: "0xabc123",
      totalPayrollAmount: "124500",
      payrollPeriodId: "2026-02",
      employeeId: "emp-001",
      employeeSsn: "111-22-3333",
      salaryAmount: "8500",
      salt: "salt-value",
    });

    expect(result.publicInputs).toEqual({
      merkleRoot: "0xabc123",
      totalPayrollAmount: "124500",
      payrollPeriodId: "2026-02",
    });
    expect(result.proof.publicSignals).toEqual(["0xabc123", "124500", "2026-02"]);
    expect(result.proof.proof.scheme).toBe("mock");
    expect(result.verification.isValid).toBe(true);
    expect(result.sorobanArgs).toHaveLength(4);
    expect(result.sorobanArgs[0]).toEqual({ type: "string", value: "0xabc123" });
    expect(result.sorobanArgs[1]).toEqual({ type: "u128", value: "124500" });
    expect(
      fetchCalls.some(
        (call) =>
          call.input === "/zk/verification_key.json" &&
          call.init?.cache === "force-cache"
      )
    ).toBe(true);
    expect(
      fetchCalls.some(
        (call) => call.input === "/zk/payroll.wasm" && call.init?.cache === "force-cache"
      )
    ).toBe(true);
  });

  it("throws when required inputs are missing", async () => {
    await expect(
      generatePayrollProof({
        merkleRoot: "   ",
        totalPayrollAmount: "124500",
        payrollPeriodId: "2026-02",
        employeeId: "emp-001",
        employeeSsn: "111-22-3333",
        salaryAmount: "8500",
      })
    ).rejects.toThrow(/merkleRoot is required/);

    expect(fetchCalls).toHaveLength(0);
  });
});
