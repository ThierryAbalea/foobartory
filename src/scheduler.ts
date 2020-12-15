import { Event } from "./events";
import { Factory } from "./Factory";

/**
 * DISCLAIMER: far from being optimal.
 *
 * The robots are spending too much time to move.
 * At least it is nice to watch them from the terminal interface ;)
 *
 * Due to lack of time, the scheduler implementation is largely sub-optimal.
 * I basically craft a quick & dirty strategy that meet the requirement
 * (to reach the objective of 30 robots in finite time) for the 2 initial
 * robots. Then I replicate the same strategy for all the new coming robots.
 * I have optmisation ideas that could be discuss during a coming interview
 * if you want. I am also motivated to implement one of my idea in the near future.
 */
export function schedule(
  factory: Factory,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expectedRobotCount: number, // could be used for the scheduling strategy
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  event: Event, // could be used for the scheduling strategy
): void {
  const robots = factory.availableRobots;
  const foos = factory.availableFoos;
  const bars = factory.availableBars;
  const foobars = factory.availableFoobars;

  for (let i = 0; i < robots.length; i++) {
    if (i % 2 === 1 && robots.length >= 2 && robots[i].status === "WAITING") {
      if (event.robotId === robots[i].id && event.type === "ROBOT_ARRIVED") {
        // let's the robot do what we have plan to do when arrived
      } else if (factory.availableMoney >= 3 && foos.length >= 6) {
        robots[i].buyRobot();
      } else if (foobars.length >= 7 /* >= 3 does not achieve the goal */) {
        robots[i].sellFoobars(foobars.length);
      } else {
        robots[i].mineFoo();
      }
    }

    if (i % 2 === 0 && robots.length >= 1 && robots[i].status === "WAITING") {
      if (event.robotId === robots[i].id && event.type === "ROBOT_ARRIVED") {
        // let's the robot do what we have plan to do when arrived
      } else if (
        robots[i].location === "BAR_MINING_WORKSTATION" &&
        bars.length < 3
      ) {
        robots[i].mineBar();
      } else if (foos.length > 0 && bars.length > 0) {
        robots[i].assembleFoobar();
      } else {
        robots[i].mineBar();
      }
    }
  }
}
