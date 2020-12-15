import clock, { useFakeClock } from "../clock";
import { Event } from "../events";
import { Factory } from "../Factory";
import { Robot, RobotProps } from "../Robot";
import { getRandomIntInclusive, bernoulli } from "../random";

let getRandomIntInclusiveMock: (min: number, max: number) => number;
let bernoulliMock: (p: number) => boolean;
jest.mock("../random", () => ({
  getRandomIntInclusive: jest.fn((min: number, max: number) =>
    getRandomIntInclusiveMock(min, max),
  ),
  bernoulli: jest.fn((p: number) => bernoulliMock(p)),
}));
const {
  getRandomIntInclusive: realImplGetRandomIntInclusive,
  bernoulli: realImplBernoulli,
} = jest.requireActual("../random");

describe("robot actions", () => {
  let factory: Factory;
  let publishedEvents: Event[];

  const aRobot = (partialRobot: Partial<RobotProps> = {}): Robot => {
    return Robot.createRobot({
      factory,
      ...partialRobot,
    });
  };

  beforeEach(() => {
    useFakeClock();
    clearTimers();
    clock.setTime(0);

    // let use by default the real implementation of getRandomIntInclusive & bernoulli
    getRandomIntInclusiveMock = realImplGetRandomIntInclusive;
    bernoulliMock = realImplBernoulli;

    factory = Factory.createFactory();
    publishedEvents = [];
    factory.subscribeEvent("1", (event: Event) => {
      publishedEvents.push(event);
    });
  });

  it("moveToWorkstation", () => {
    // given
    const robot = aRobot({
      id: "ROBOT-1",
      status: "WAITING",
      location: "PARKING",
    });
    // when
    robot.moveToWorkstation("FOO_MINING_WORKSTATION");
    // then
    expect(robot).toMatchObject({
      status: "MOVING",
      location: "IN_TRANSIT",
      destination: "FOO_MINING_WORKSTATION",
    });
    // when
    advanceTime(5000);
    // then
    expect(robot).toMatchObject({
      status: "WAITING",
      location: "FOO_MINING_WORKSTATION",
    });
    expect(publishedEvents).toEqual([
      {
        type: "ROBOT_MOVE_INITIATED",
        timestamp: 0,
        robotId: "ROBOT-1",
        robotStatus: "MOVING",
        destination: "FOO_MINING_WORKSTATION",
        origin: "PARKING",
        travelTime: 5000,
      },
      {
        type: "ROBOT_ARRIVED",
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        newLocation: "FOO_MINING_WORKSTATION",
        timestamp: 5000,
      },
    ]);
  });

  it("mineFoo", () => {
    // given
    const robot = aRobot({
      id: "ROBOT-1",
      status: "WAITING",
      location: "PARKING",
    });
    // when
    robot.mineFoo();
    // then
    expect(robot).toMatchObject({
      status: "MOVING",
      location: "IN_TRANSIT",
      destination: "FOO_MINING_WORKSTATION",
    });
    // when
    advanceTime(5000);
    // then
    expect(robot).toMatchObject({
      status: "MINING_FOO",
      location: "FOO_MINING_WORKSTATION",
    });
    expect(factory.availableFoos).toEqual([]);
    // when
    advanceTime(6000);
    // then
    expect(robot).toMatchObject({
      status: "WAITING",
      location: "FOO_MINING_WORKSTATION",
    });
    expect(factory.availableFoos).toEqual([{ serialNumber: "FOO-1" }]);

    // when
    robot.mineFoo();
    // then
    expect(robot).toMatchObject({
      status: "MINING_FOO",
      location: "FOO_MINING_WORKSTATION",
    });
    // when
    advanceTime(7000);
    // then
    expect(robot).toMatchObject({
      status: "WAITING",
      location: "FOO_MINING_WORKSTATION",
    });
    expect(factory.availableFoos).toEqual([
      { serialNumber: "FOO-1" },
      { serialNumber: "FOO-2" },
    ]);
    expect(publishedEvents).toEqual([
      {
        type: "ROBOT_MOVE_INITIATED",
        timestamp: 0,
        robotId: "ROBOT-1",
        robotStatus: "MOVING",
        origin: "PARKING",
        destination: "FOO_MINING_WORKSTATION",
        travelTime: 5000,
      },
      {
        type: "ROBOT_ARRIVED",
        timestamp: 5000,
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        newLocation: "FOO_MINING_WORKSTATION",
      },
      {
        type: "FOO_MINING_INITIATED",
        timestamp: 5000,
        robotId: "ROBOT-1",
        robotStatus: "MINING_FOO",
      },
      {
        type: "FOO_ADDED_TO_INVENTORY",
        timestamp: 11000,
        robotId: "ROBOT-1",
        robotStatus: "MINING_FOO",
        serialNumber: "FOO-1",
      },
      {
        type: "FOO_MINED",
        timestamp: 11000,
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        serialNumber: "FOO-1",
      },
      {
        type: "FOO_MINING_INITIATED",
        timestamp: 11000,
        robotId: "ROBOT-1",
        robotStatus: "MINING_FOO",
      },
      {
        type: "FOO_ADDED_TO_INVENTORY",
        timestamp: 18000,
        robotId: "ROBOT-1",
        robotStatus: "MINING_FOO",
        serialNumber: "FOO-2",
      },
      {
        type: "FOO_MINED",
        timestamp: 18000,
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        serialNumber: "FOO-2",
      },
    ]);
  });

  it("mineBar", () => {
    // given
    const robot = aRobot({
      id: "ROBOT-1",
      status: "WAITING",
      location: "PARKING",
    });

    // when
    robot.mineBar();
    // then
    expect(robot).toMatchObject({
      status: "MOVING",
      location: "IN_TRANSIT",
      destination: "BAR_MINING_WORKSTATION",
    });
    // when
    getRandomIntInclusiveMock = () => 1041;
    advanceTime(5000);
    // then
    expect(getRandomIntInclusive).toHaveBeenLastCalledWith(500, 2000);
    expect(robot).toMatchObject({
      status: "MINING_BAR",
      location: "BAR_MINING_WORKSTATION",
    });
    expect(factory.availableBars).toEqual([]);
    // when
    advanceTime(1041);
    // then
    expect(robot).toMatchObject({
      status: "WAITING",
      location: "BAR_MINING_WORKSTATION",
    });
    expect(factory.availableBars).toEqual([{ serialNumber: "BAR-1" }]);

    // when
    getRandomIntInclusiveMock = () => 517;
    robot.mineBar();
    // then
    expect(getRandomIntInclusive).toHaveBeenLastCalledWith(500, 2000);
    expect(robot).toMatchObject({
      status: "MINING_BAR",
      location: "BAR_MINING_WORKSTATION",
    });
    // when
    advanceTime(517);
    // then
    expect(robot).toMatchObject({
      status: "WAITING",
      location: "BAR_MINING_WORKSTATION",
    });
    expect(factory.availableBars).toEqual([
      { serialNumber: "BAR-1" },
      { serialNumber: "BAR-2" },
    ]);
    expect(publishedEvents).toEqual([
      {
        type: "ROBOT_MOVE_INITIATED",
        timestamp: 0,
        robotId: "ROBOT-1",
        robotStatus: "MOVING",
        origin: "PARKING",
        destination: "BAR_MINING_WORKSTATION",
        travelTime: 5000,
      },
      {
        type: "ROBOT_ARRIVED",
        timestamp: 5000,
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        newLocation: "BAR_MINING_WORKSTATION",
      },
      {
        type: "BAR_MINING_INITIATED",
        timestamp: 5000,
        robotId: "ROBOT-1",
        robotStatus: "MINING_BAR",
      },
      {
        type: "BAR_ADDED_TO_INVENTORY",
        timestamp: 5000 + 1041,
        robotId: "ROBOT-1",
        robotStatus: "MINING_BAR",
        serialNumber: "BAR-1",
      },
      {
        type: "BAR_MINED",
        timestamp: 5000 + 1041,
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        serialNumber: "BAR-1",
      },
      {
        type: "BAR_MINING_INITIATED",
        timestamp: 5000 + 1041,
        robotId: "ROBOT-1",
        robotStatus: "MINING_BAR",
      },
      {
        type: "BAR_ADDED_TO_INVENTORY",
        timestamp: 5000 + 1041 + 517,
        robotId: "ROBOT-1",
        robotStatus: "MINING_BAR",
        serialNumber: "BAR-2",
      },
      {
        type: "BAR_MINED",
        timestamp: 5000 + 1041 + 517,
        robotId: "ROBOT-1",
        robotStatus: "WAITING",
        serialNumber: "BAR-2",
      },
    ]);
  });

  describe("assembleFoobar", () => {
    describe("when luck is on our side", () => {
      beforeEach(() => {
        // lucky
        bernoulliMock = () => true;
      });

      it("should be able assemble multiples foobars from foos and bars", () => {
        // given
        const robot = aRobot({
          id: "ROBOT-1",
          status: "WAITING",
          location: "PARKING",
        });
        factory.addFooToInventory(robot, { serialNumber: "FOO-42" });
        factory.addFooToInventory(robot, { serialNumber: "FOO-43" });
        factory.addBarToInventory(robot, { serialNumber: "BAR-101" });
        factory.addBarToInventory(robot, { serialNumber: "BAR-102" });
        publishedEvents.length = 0;

        // when
        robot.assembleFoobar();
        // then
        expect(robot).toMatchObject({
          status: "MOVING",
          location: "IN_TRANSIT",
          destination: "FOOBAR_ASSEMBLING_WORKSTATION",
        });

        // when
        advanceTime(5000);
        // then
        expect(robot).toMatchObject({
          status: "ASSEMBLING_FOOBAR",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        // the foo & the bar used for the assembling are removed
        // from the inventory at the beginning of the assembly.
        expect(factory.availableFoos).toHaveLength(1);
        expect(factory.availableBars).toHaveLength(1);

        // when
        advanceTime(2000);
        // the assembling operation has a probability of success of 60%.
        expect(bernoulli).toHaveBeenLastCalledWith(0.6);
        // expect(factory).toMatchObject({...}) is voluntary not used
        // to not overspecified the expected behavior.
        // Indeed, the robot may pick any foo or bar to assemble the foobar (LIFO, FIFO, ...).
        expect(factory.availableFoobars).toHaveLength(1);
        const foobar = factory.availableFoobars[0];
        expect(foobar.serialNumber).toEqual("FOOBAR-1");
        expect(foobar.fooSerialNumber).toBePartOf(["FOO-42", "FOO-43"]);
        expect(foobar.barSerialNumber).toBePartOf(["BAR-101", "BAR-102"]);
        // checks that the inventory does not contain the foo
        // and the bar used to assemble the foobar.
        expect(factory.availableFoos).not.toContain({
          serialNumber: foobar.fooSerialNumber,
        });
        expect(factory.availableBars).not.toContain({
          serialNumber: foobar.barSerialNumber,
        });

        // when
        robot.assembleFoobar();
        // then
        expect(factory.availableFoos).toHaveLength(0);
        expect(factory.availableBars).toHaveLength(0);
        // when
        advanceTime(2000);
        // then
        expect(factory.availableFoobars).toHaveLength(2);
        expect(factory.availableFoobars[1].serialNumber).toEqual("FOOBAR-2");
        expect(factory.availableFoos).toHaveLength(0);
        expect(factory.availableBars).toHaveLength(0);
        expect(factory.availableFoobars).toHaveLength(2);
        expect(factory.availableFoobars).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              serialNumber: expect.any(String),
              fooSerialNumber: "FOO-42",
              barSerialNumber: "BAR-101",
            }),
            expect.objectContaining({
              serialNumber: expect.any(String),
              fooSerialNumber: "FOO-43",
              barSerialNumber: "BAR-102",
            }),
          ]),
        );
        expect(publishedEvents).toHaveLength(12);
        expect(publishedEvents).toEqual(
          expect.arrayContaining([
            {
              type: "ROBOT_MOVE_INITIATED",
              timestamp: 0,
              robotId: "ROBOT-1",
              robotStatus: "MOVING",
              origin: "PARKING",
              destination: "FOOBAR_ASSEMBLING_WORKSTATION",
              travelTime: 5000,
            },
            {
              type: "ROBOT_ARRIVED",
              timestamp: 5000,
              robotId: "ROBOT-1",
              robotStatus: "WAITING",
              newLocation: "FOOBAR_ASSEMBLING_WORKSTATION",
            },
            {
              type: "FOO_REMOVED_FROM_INVENTORY",
              timestamp: 5000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              serialNumber: "FOO-43",
            },
            {
              type: "BAR_REMOVED_FROM_INVENTORY",
              timestamp: 5000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              serialNumber: "BAR-102",
            },
            {
              type: "FOOBAR_ASSEMBLING_INITIATED",
              timestamp: 5000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              fooSerialNumber: "FOO-43",
              barSerialNumber: "BAR-102",
            },
            expect.objectContaining({
              type: "FOOBAR_ADDED_TO_INVENTORY",
              timestamp: 7000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              serialNumber: expect.any(String),
            }),
            expect.objectContaining({
              type: "FOOBAR_ASSEMBLED",
              timestamp: 7000,
              robotId: "ROBOT-1",
              robotStatus: "WAITING",
              serialNumber: expect.any(String),
              fooSerialNumber: "FOO-43",
              barSerialNumber: "BAR-102",
            }),
            {
              type: "FOO_REMOVED_FROM_INVENTORY",
              timestamp: 7000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              serialNumber: "FOO-42",
            },
            {
              type: "BAR_REMOVED_FROM_INVENTORY",
              timestamp: 7000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              serialNumber: "BAR-101",
            },
            {
              type: "FOOBAR_ASSEMBLING_INITIATED",
              timestamp: 7000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              fooSerialNumber: "FOO-42",
              barSerialNumber: "BAR-101",
            },
            expect.objectContaining({
              type: "FOOBAR_ADDED_TO_INVENTORY",
              timestamp: 9000,
              robotId: "ROBOT-1",
              robotStatus: "ASSEMBLING_FOOBAR",
              serialNumber: expect.any(String),
            }),
            expect.objectContaining({
              type: "FOOBAR_ASSEMBLED",
              timestamp: 9000,
              robotId: "ROBOT-1",
              robotStatus: "WAITING",
              serialNumber: expect.any(String),
              fooSerialNumber: "FOO-42",
              barSerialNumber: "BAR-101",
            }),
          ]),
        );
      });

      it("should not assemble foobar when no bar is in the inventory", () => {
        const robot = aRobot({
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        factory.addFooToInventory(robot, { serialNumber: "FOO-42" });
        publishedEvents.length = 0;
        // when
        robot.assembleFoobar();
        // then
        expect(robot).toMatchObject({
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        // when
        advanceTime(2000);
        // then
        expect(robot).toMatchObject({
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        expect(factory.availableFoos).toEqual([{ serialNumber: "FOO-42" }]);
        expect(factory.availableBars).toHaveLength(0);
        expect(factory.availableFoobars).toHaveLength(0);
        expect(publishedEvents).toEqual([]);
      });

      it("should not assemble foobar when no foo is in the inventory", () => {
        const robot = aRobot({
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        factory.addBarToInventory(robot, { serialNumber: "BAR-101" });
        publishedEvents.length = 0;
        // when
        robot.assembleFoobar();
        // then
        expect(robot).toMatchObject({
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        // when
        advanceTime(2000);
        // then
        expect(robot).toMatchObject({
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        expect(factory.availableFoos).toHaveLength(0);
        expect(factory.availableBars).toEqual([{ serialNumber: "BAR-101" }]);
        expect(factory.availableFoobars).toHaveLength(0);
        expect(publishedEvents).toEqual([]);
      });
    });

    describe("when we are unlucky", () => {
      beforeEach(() => {
        // unlucky
        bernoulliMock = () => false;
      });

      it("should be able assemble multiples foobars from foos and bars", () => {
        // given
        const robot = aRobot({
          id: "ROBOT-1",
          status: "WAITING",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        factory.addFooToInventory(robot, { serialNumber: "FOO-42" });
        factory.addBarToInventory(robot, { serialNumber: "BAR-101" });
        publishedEvents.length = 0;

        // when
        robot.assembleFoobar();
        // then
        expect(robot).toMatchObject({
          status: "ASSEMBLING_FOOBAR",
          location: "FOOBAR_ASSEMBLING_WORKSTATION",
        });
        // the foo & the bar used for the assembling are removed
        // from the inventory at the beginning of the assembly.
        expect(factory.availableFoos).toEqual([]);
        expect(factory.availableBars).toEqual([]);

        // when
        advanceTime(2000);
        // the assembling operation has a probability of success of 60%.
        expect(bernoulli).toHaveBeenLastCalledWith(0.6);
        expect(factory.availableFoos).toEqual([]);
        expect(factory.availableBars).toEqual([{ serialNumber: "BAR-101" }]);
        expect(factory.availableFoobars).toEqual([]);
        expect(publishedEvents).toEqual([
          {
            type: "FOO_REMOVED_FROM_INVENTORY",
            timestamp: 0,
            robotId: "ROBOT-1",
            robotStatus: "ASSEMBLING_FOOBAR",
            serialNumber: "FOO-42",
          },
          {
            type: "BAR_REMOVED_FROM_INVENTORY",
            timestamp: 0,
            robotId: "ROBOT-1",
            robotStatus: "ASSEMBLING_FOOBAR",
            serialNumber: "BAR-101",
          },
          {
            type: "FOOBAR_ASSEMBLING_INITIATED",
            timestamp: 0,
            robotId: "ROBOT-1",
            robotStatus: "ASSEMBLING_FOOBAR",
            fooSerialNumber: "FOO-42",
            barSerialNumber: "BAR-101",
          },
          {
            type: "BAR_ADDED_TO_INVENTORY",
            timestamp: 2000,
            robotId: "ROBOT-1",
            robotStatus: "ASSEMBLING_FOOBAR",
            serialNumber: "BAR-101",
          },
          {
            type: "FOOBAR_ASSEMBLING_FAILED",
            timestamp: 2000,
            robotId: "ROBOT-1",
            robotStatus: "WAITING",
            fooSerialNumber: "FOO-42",
            barSerialNumber: "BAR-101",
          },
        ]);
      });
    });
  });
});

function advanceTime(additionalTimeInMs: number): void {
  clock.setTime(clock.getTime() + additionalTimeInMs);
}

function clearTimers() {
  // to clear all potential remaining timers, let's trigger all of them by setting the time to its maximum value.
  // this "trick" avoid to introduce a function in the module timer only used by the tests.
  const time = clock.getTime();
  clock.setTime(Number.MAX_VALUE);
  clock.setTime(time);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBePartOf(array: Array<unknown>): R;
    }
  }
}

expect.extend({
  // instead of:
  //   expect(
  //     ["FOO-42", "FOO-43"].some((n) => n === foobar.fooSerialNumber),
  //   ).toBeTruthy();
  // write:
  //   expect(foobar.fooSerialNumber).toBePartOf(["FOO-42", "FOO-43"]);
  toBePartOf(object, array: Array<unknown>) {
    return {
      message: () =>
        `expected object ${object.toString()} to be part of the array ${JSON.stringify(
          array,
        )}`,
      pass: array.includes(object),
    };
  },
});
