import { improvementEngine } from "@/scan-engine/ImprovementEngine";

describe("ImprovementEngine Unit Tests", () => {
  it("should detect resolved vulnerabilities when findings drop", () => {
    const prev = [
      {
        provider: "Test Provider",
        status: "success" as const,
        severity: "high" as const,
        score: 65,
        findings: [
          { type: "Weak SSL", severity: "high" as const, description: "Vulnerable ciphers", recommendation: "Fix ciphers" }
        ],
        metadata: {}
      }
    ];

    const curr = [
      {
        provider: "Test Provider",
        status: "success" as const,
        severity: "low" as const,
        score: 100,
        findings: [],
        metadata: {}
      }
    ];

    const comparison = improvementEngine.compareScans(prev, curr, 65, 100);
    expect(comparison.changesDetected).toBe(true);
    expect(comparison.improvements.length).toBe(1);
    expect(comparison.improvements[0]).toBe("Resolved: Weak SSL");
  });
});

function describe(name: string, fn: () => void) {
  console.log(`[Suite] ${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  console.log(`  [Test] ${name}`);
  try {
    fn();
  } catch (err) {
    console.error(`    [Fail] ${err}`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    }
  };
}
