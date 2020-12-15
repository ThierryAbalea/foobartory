import React, { useState, useEffect, ReactElement } from "react";
import { Box, Text } from "ink";
import { v4 as uuid } from "uuid";
import { Event, SubscribeEvent, UnsubscribeEvent } from "../events";

interface ClockProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
  speedUpFactor: number;
}

// A refresh time of 100 ms is useful when the game time is speed up,
// e.g. 10 seconds of the game corresponds to 1 real second.
// There is no real benefit to compute the refresh time from the speed up factor.
const REFRESH_TIME_IN_MS = 100;

function Clock({
  subscribeEvent,
  unsubscribeEvent,
  speedUpFactor,
}: ClockProps): ReactElement<ClockProps> {
  const [clock, setClock] = useState(0);
  let firstEventTimestamp: number;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const subscriberId = uuid();
    subscribeEvent(subscriberId, (event: Event) => {
      switch (event.type) {
        default:
          firstEventTimestamp = Date.now();
          timer = setInterval(() => {
            // let's display a clock starting from 00:00:00 at the beginning of the game.
            const relativeTime = Date.now() - firstEventTimestamp;
            setClock(relativeTime * speedUpFactor);
          }, REFRESH_TIME_IN_MS);
          // we care only about the first event => we can unsubscribe
          unsubscribeEvent(subscriberId);
          break;
      }
    });
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return (
    <Box>
      <Text color="yellow">{new Date(clock).toISOString().substr(11, 8)}</Text>
    </Box>
  );
}

export default Clock;
