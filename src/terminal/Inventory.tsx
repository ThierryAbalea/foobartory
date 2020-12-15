import React, { useState, useEffect, ReactElement } from "react";
import { Box } from "ink";
import { v4 as uuid } from "uuid";
import { Event, SubscribeEvent, UnsubscribeEvent } from "../events";
import BlinkingCounter, { addCountBuilder } from "./BlinkingCounter";

interface InventoryProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
}

function Inventory({
  subscribeEvent,
  unsubscribeEvent,
}: InventoryProps): ReactElement<InventoryProps> {
  const timers: Record<string, NodeJS.Timer> = {};

  const defaultCounter: BlinkingCounter = {
    count: 0,
    recentlyUpdated: false,
  };
  const [fooCounter, setFooCounter] = useState(defaultCounter);
  const [barCounter, setBarCounter] = useState(defaultCounter);
  const [foobarCounter, setFoobarCounter] = useState(defaultCounter);
  const [moneyCounter, setMoneyCounter] = useState(defaultCounter);

  useEffect(() => {
    const addFooCount = addCountBuilder(timers, setFooCounter);
    const addBarCount = addCountBuilder(timers, setBarCounter);
    const addFoobarCount = addCountBuilder(timers, setFoobarCounter);
    const addMoneyCount = addCountBuilder(timers, setMoneyCounter);

    const subscriberId = uuid();
    subscribeEvent(subscriberId, (event: Event) => {
      switch (event.type) {
        case "FOO_ADDED_TO_INVENTORY":
          addFooCount(1);
          break;
        case "FOO_REMOVED_FROM_INVENTORY":
          addFooCount(-1);
          break;
        case "BAR_ADDED_TO_INVENTORY":
          addBarCount(1);
          break;
        case "BAR_REMOVED_FROM_INVENTORY":
          addBarCount(-1);
          break;
        case "FOOBAR_ADDED_TO_INVENTORY":
          addFoobarCount(1);
          break;
        case "FOOBAR_REMOVED_FROM_INVENTORY":
          addFoobarCount(-1);
          break;
        case "MONEY_WON":
          addMoneyCount(event.amount);
          break;
        case "MONEY_SPENT":
          addMoneyCount(-1 * event.amount);
          break;
      }
    });
    return () => {
      unsubscribeEvent(subscriberId);
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, []);

  return (
    <Box flexDirection="row">
      <BlinkingCounter label={"foos"} counter={fooCounter} />
      <BlinkingCounter label={"bars"} counter={barCounter} />
      <BlinkingCounter label={"foobars"} counter={foobarCounter} />
      <BlinkingCounter label={"💰"} counter={moneyCounter} />
    </Box>
  );
}

export default Inventory;
