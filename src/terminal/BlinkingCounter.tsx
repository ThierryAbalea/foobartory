import React, { ReactElement } from "react";
import { Box, Text } from "ink";
import { v4 as uuid } from "uuid";

interface BlinkingCounterProps {
  label: string;
  counter: BlinkingCounter;
}

interface BlinkingCounter {
  count: number;
  recentlyUpdated: boolean;
}

function BlinkingCounter({
  label,
  counter: { count, recentlyUpdated },
}: BlinkingCounterProps): ReactElement<BlinkingCounterProps> {
  return (
    <Box marginRight={3}>
      <Text color="white">{label}: </Text>
      <Text
        color={recentlyUpdated ? "black" : "yellow"}
        backgroundColor={recentlyUpdated ? "yellow" : "black"}
      >
        {" "}
        {count}{" "}
      </Text>
    </Box>
  );
}

export type SetBlinkingCounter = React.Dispatch<
  React.SetStateAction<BlinkingCounter>
>;

export function addCountBuilder(
  timers: Record<string, NodeJS.Timer>,
  counter: SetBlinkingCounter,
  count = 0,
  timer: NodeJS.Timeout | null = null,
): (increment: number) => void {
  const blinkDelayInMs = 500;
  return (increment: number) => {
    count += increment;
    if (timer) {
      // to avoid the counter coming back to an old value during a short period of time
      clearTimeout(timer);
    }
    counter({ count, recentlyUpdated: true });
    const timerId = uuid();
    timer = setTimeout(() => {
      counter({ count, recentlyUpdated: false });
      delete timers[timerId];
    }, blinkDelayInMs);
    timers[timerId] = timer;
  };
}

export default BlinkingCounter;
