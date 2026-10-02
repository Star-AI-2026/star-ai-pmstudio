// @ts-nocheck -- run with `bun test`
import { expect, test } from "bun:test";
import { compareVersions, evaluatePolicy, isFeatureAllowed, normalizePolicy } from "./policy";

const base = {
  latestVersion: "1.0.1", minimumVersion: "1.0.1", channel: "stable",
  betaVersion: "", betaReleaseNotes: [], releaseNotes: ["x"],
  downloadUrl: "", setupFileName: "a.exe", setupDownloadUrl: "",
  featureRequirements: { advancedTools: "1.1.0" },
};
const p = (o: object) => normalizePolicy({ ...base, ...o });

test("semver", () => {
  expect(compareVersions("1.0.10", "1.0.9")).toBe(1);
  expect(compareVersions("1.1.0", "1.0.10")).toBe(1);
  expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
  expect(compareVersions("1.0.2 Beta", "1.0.2")).toBe(0);
});
test("T1 none", () => expect(evaluatePolicy("1.0.1", p({})).kind).toBe("none"));
test("T2 optional", () => expect(evaluatePolicy("1.0.1", p({ latestVersion: "1.0.2" })).kind).toBe("optional"));
test("T3 mandatory", () =>
  expect(evaluatePolicy("1.0.1", p({ latestVersion: "1.0.2", minimumVersion: "1.0.2" })).kind).toBe("mandatory"));
test("T4 beta never mandatory", () => expect(evaluatePolicy("1.0.1", p({ betaVersion: "1.0.2 Beta" })).kind).toBe("beta"));
test("features", () => {
  expect(isFeatureAllowed("advancedTools", "1.0.1", p({}))).toBe(false);
  expect(isFeatureAllowed("advancedTools", "1.1.0", p({}))).toBe(true);
  expect(isFeatureAllowed("advancedTools", null, null)).toBe(true);
});
test("T7 invalid json throws", () => expect(() => normalizePolicy({})).toThrow());
