import { sum } from "./sum/index";

describe("utilities", () => {
  test("sum", () => {
    const total = sum(1, 2);
    expect(total).toBe(3);
  });
});
