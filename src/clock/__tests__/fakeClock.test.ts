import clock from "../fakeClock";

describe("clock", () => {
  it("should trigger the timer callbacks at the right moment when setTime is called", () => {
    let cb1Called = 0;
    let cb2Called = 0;
    // setting order does not matter
    clock.setTimeout(() => cb2Called++, 2000);
    clock.setTimeout(() => cb1Called++, 1000);

    clock.setTime(500);
    expect(cb1Called).toEqual(0);
    expect(cb2Called).toEqual(0);

    clock.setTime(1000);
    expect(cb1Called).toEqual(1);
    expect(cb2Called).toEqual(0);

    clock.setTime(2000);
    expect(cb1Called).toEqual(1);
    expect(cb2Called).toEqual(1);
  });
});
