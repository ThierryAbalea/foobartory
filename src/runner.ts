import { v4 as uuid } from "uuid";
import { promisify } from "util";
import { Factory } from "./Factory";
import { Event } from "./events";
import { schedule } from "./scheduler";

const setTimeoutPromise = promisify(setTimeout);

export interface RunParams {
  factory: Factory;
  expectedRobotCount: number;
  initialRobotCount: number;
  timeoutInMs: number;
}
export type RunResult = { hasCompleted: boolean; timeoutInMs: number };

export async function run({
  factory,
  expectedRobotCount,
  initialRobotCount,
  timeoutInMs,
}: RunParams): Promise<RunResult> {
  const startTime = Date.now();
  let hasTimeout = false;
  let hasCompleted = false;

  const subscriptionId = uuid();
  factory.subscribeEvent(subscriptionId, (event: Event) => {
    if (factory.availableRobots.length >= expectedRobotCount) {
      // goal achieved: stop
      process.nextTick(() => factory.unsubscribeEvent(subscriptionId));
    }
    schedule(factory, expectedRobotCount, event);
  });

  factory.setup(initialRobotCount);

  while (!hasCompleted && !hasTimeout) {
    // let's check, every 100 ms, if the goal is achieved
    await setTimeoutPromise(100);
    hasTimeout = Date.now() - startTime >= timeoutInMs;
    hasCompleted = factory.availableRobots.length === expectedRobotCount;
  }

  return {
    hasCompleted,
    timeoutInMs,
  };
}
