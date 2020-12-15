import React, { useState, useEffect, ReactElement } from "react";
import { Box, Text } from "ink";
import { v4 as uuid } from "uuid";
import { Event, SubscribeEvent, UnsubscribeEvent } from "../events";
import BlinkingCounter, { addCountBuilder } from "./BlinkingCounter";

interface StatisticsProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
  expectedRobotCount: number;
}

function Statistics({
  subscribeEvent,
  unsubscribeEvent,
  expectedRobotCount,
}: StatisticsProps): ReactElement<StatisticsProps> {
  const timers: Record<string, NodeJS.Timer> = {};

  const defaultCounter: BlinkingCounter = {
    count: 0,
    recentlyUpdated: false,
  };
  const [robotCounter, setRobotCounter] = useState(defaultCounter);
  const [fooCounter, setFooCounter] = useState(defaultCounter);
  const [barCounter, setBarCounter] = useState(defaultCounter);
  const [foobarCounter, setFoobarCounter] = useState(defaultCounter);
  const [foobarFailureCounter, setFoobarFailureCounter] = useState(
    defaultCounter,
  );
  const [moveCounter, setMoveCounter] = useState(defaultCounter);
  const [moneyWonCounter, setMoneyWonCounter] = useState(defaultCounter);
  const [moneySpentCounter, setMoneySpentCounter] = useState(defaultCounter);

  useEffect(() => {
    const addRobotCount = addCountBuilder(timers, setRobotCounter);
    const addFooCount = addCountBuilder(timers, setFooCounter);
    const addBarCount = addCountBuilder(timers, setBarCounter);
    const addFoobarCount = addCountBuilder(timers, setFoobarCounter);
    const addFoobarFailureCount = addCountBuilder(
      timers,
      setFoobarFailureCounter,
    );
    const addMoveCount = addCountBuilder(timers, setMoveCounter);
    const addMoneyWonCount = addCountBuilder(timers, setMoneyWonCounter);
    const addMoneySpentCount = addCountBuilder(timers, setMoneySpentCounter);

    const subscriberId = uuid();
    subscribeEvent(subscriberId, (event: Event) => {
      switch (event.type) {
        case "ROBOT_PARKED":
          addRobotCount(1);
          break;
        case "FOO_MINED":
          addFooCount(1);
          break;
        case "BAR_MINED":
          addBarCount(1);
          break;
        case "FOOBAR_ASSEMBLED":
          addFoobarCount(1);
          break;
        case "FOOBAR_ASSEMBLING_FAILED":
          addFoobarFailureCount(1);
          break;
        case "ROBOT_ARRIVED":
          addMoveCount(1);
          break;
        case "MONEY_WON":
          addMoneyWonCount(event.amount);
          break;
        case "MONEY_SPENT":
          addMoneySpentCount(event.amount);
          break;
      }
    });
    return () => {
      unsubscribeEvent(subscriberId);
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, []);

  return (
    <Box flexDirection="column">
      <Box flexDirection="row">
        <BlinkingCounter label={"foos"} counter={fooCounter} />
        <BlinkingCounter label={"bars"} counter={barCounter} />
        <BlinkingCounter label={"foobars"} counter={foobarCounter} />
        <BlinkingCounter
          label={"foobar failures"}
          counter={foobarFailureCounter}
        />
        <BlinkingCounter label={"moves"} counter={moveCounter} />
      </Box>
      <Box flexDirection="row">
        <BlinkingCounter label={"💰 won"} counter={moneyWonCounter} />
        <BlinkingCounter label={"💰 spent"} counter={moneySpentCounter} />
      </Box>
      <RobotCounter
        robotCounter={robotCounter}
        expectedRobotCount={expectedRobotCount}
      />
    </Box>
  );
}

interface RobotCounterProps {
  robotCounter: BlinkingCounter;
  expectedRobotCount: number;
}

function RobotCounter({
  robotCounter: { count, recentlyUpdated },
  expectedRobotCount,
}: RobotCounterProps): ReactElement<RobotCounterProps> {
  return (
    <Box flexDirection="row">
      <Text color="white">robots: </Text>
      <Text
        color={recentlyUpdated ? "black" : "yellow"}
        backgroundColor={recentlyUpdated ? "yellow" : "black"}
      >
        {" "}
        {count}{" "}
      </Text>
      <Text color="white"> / {expectedRobotCount} </Text>
      <ProgressBar
        percent={count / expectedRobotCount}
        completedChar={"🤖"}
        uncompletedChar={"㊀"}
        width={expectedRobotCount}
      />
    </Box>
  );
}

interface ProgressBarProps {
  percent: number;
  completedChar: string;
  uncompletedChar: string;
  width: number;
}

function ProgressBar({
  percent,
  completedChar,
  uncompletedChar,
  width,
}: ProgressBarProps): ReactElement<ProgressBarProps> {
  return (
    <Text>
      {completedChar.repeat(percent * width)}
      {uncompletedChar.repeat(width - percent * width)}
    </Text>
  );
}

export default Statistics;
