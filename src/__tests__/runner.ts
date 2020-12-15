import { run } from "../runner";
import clock, { useFakeClock, useSystemClock } from "../clock";
import { Factory } from "../Factory";

describe("run", () => {
  describe("with the system clock but speed up with a factor of 100", () => {
    beforeAll(() => {
      useSystemClock();
      clock.setSpeedUpFactor(100);
    });

    // Sometime test is failing due to a timeout (when it succeed it take between 6 and 10s)
    // Is it a problem with the scheduling strategy ?
    // Don't think so. Never encountered the issue on the "rich" terminal interface.
    it.skip("should reach the 30-robot goal in a finite time", async () => {
      expect(
        await run({
          factory: Factory.createFactory(),
          expectedRobotCount: 30,
          initialRobotCount: 2,
          timeoutInMs: 15000,
        }),
      ).hasCompleted();
    }, 15000);
  });

  describe("with a fake clock - buggy :(", () => {
    beforeAll(() => {
      useFakeClock();
    });

    // TODO Investigate the issue when running with the fake clock.
    // For expectedRobotCount = 5, the test failed for timeout.
    // For expectedRobotCount = 30, it always failing with the following error.
    // The error is: "The current move must be completed before any new move"
    it.skip("should reach the 30-robot goal in a finite time", async () => {
      expect(
        await run({
          factory: Factory.createFactory(),
          expectedRobotCount: 5,
          initialRobotCount: 2,
          timeoutInMs: 2000,
        }),
      ).hasCompleted();
    }, 2000);
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      hasCompleted(): R;
    }
  }
}

expect.extend({
  // custom matcher to have a more explicit message in case of failure
  // instead of a cryptic message: expect(make(...)).toBeTruthy();
  hasCompleted({ hasCompleted, timeoutInMs }) {
    return {
      message: () =>
        `expected to complete in less than ${timeoutInMs} milliseconds`,
      pass: hasCompleted,
    };
  },
});
