import { useSystemClock } from "./clock";
import { Event } from "./events";
import { Factory } from "./Factory";
import { run } from "./runner";
import { runTerminalInterface } from "./terminal";

const INITIAL_ROBOT_COUNT = 2;
const EXPECTED_ROBOT_COUNT = 30;
const TIMEOUT_IN_MS = 1200000;

async function main(): Promise<void> {
  useSystemClock();

  const factory = Factory.createFactory();

  const runFactory = () =>
    run({
      factory,
      expectedRobotCount: EXPECTED_ROBOT_COUNT,
      initialRobotCount: INITIAL_ROBOT_COUNT,
      timeoutInMs: TIMEOUT_IN_MS,
    });

  const subscribeEvent = (
    subscriberId: string,
    onEvent: (event: Event) => void,
  ) => factory.subscribeEvent(subscriberId, onEvent);

  const unsubscribeEvent = (subscriberId: string) =>
    factory.unsubscribeEvent(subscriberId);

  runTerminalInterface(
    subscribeEvent,
    unsubscribeEvent,
    runFactory,
    EXPECTED_ROBOT_COUNT,
  );
}

main();
