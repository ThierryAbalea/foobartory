import React, { useState, useEffect, ReactElement } from "react";
import { Box, Text } from "ink";
import {
  Event,
  RobotStatus,
  SubscribeEvent,
  UnsubscribeEvent,
  Workstation,
} from "../events";
import Spinner from "ink-spinner";
import { v4 as uuid } from "uuid";

const ORDERED_WORKSTATION_LABELS = {
  PARKING: "parking",
  FOO_MINING_WORKSTATION: "foo",
  BAR_MINING_WORKSTATION: "bar",
  FOOBAR_ASSEMBLING_WORKSTATION: "foobar",
  FOOBAR_SELLING_WORKSTATION: "sales",
  ROBOT_BUYING_WORKSTATION: "purchase",
};
const WORKSTATION_SPACE_IN_CHARS = 15;
const ROBOT_CHAR = "🤖";
// the emoji 🤖 corresponds approximatively to 2 characters (even for monospaced font)
const ROBOT_CHAR_WIDTH = 2;

// the dashboard represents the robot in 2 different ways (could be more than 2 obviously)
type RobotVisualStatus =
  | "UNPRODUCTIVE" // waiting or moving
  | "PRODUCTIVE"; // mining, assembling, selling or buying

interface Robot {
  id: string;
  position: number;
  visualStatus: RobotVisualStatus;
}

interface ActivityProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
  expectedRobotCount: number;
  speedUpFactor: number;
}

function Activity({
  subscribeEvent,
  unsubscribeEvent,
  expectedRobotCount,
  speedUpFactor,
}: ActivityProps): ReactElement<ActivityProps> {
  const timers: Record<string, NodeJS.Timer> = {};

  const [robots, setRobots] = useState<Record<string, Robot>>({});

  useEffect(() => {
    const subscriberId = uuid();
    subscribeEvent(subscriberId, eventHandler({}));
    return () => {
      unsubscribeEvent(subscriberId);
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, []);

  function eventHandler(robots: Record<string, Robot>): (event: Event) => void {
    return (event: Event): void => {
      const { robotId, robotStatus } = event;
      let robot = robots[robotId];
      if (!robot) {
        // First time we see this robot.
        // Without any doubt, the move corresponds to the initial move from the parking
        if (event.type !== "ROBOT_PARKED") {
          throw new Error(
            "The first expected event for a robot must be of the type ROBOT_PARKED",
          );
        }
        robot = {
          id: robotId,
          position: computePosition(event.location),
          visualStatus: "UNPRODUCTIVE",
        };
        robots[robotId] = robot;
      }

      robot.visualStatus = visualStatus(robotStatus);
      setRobots({ ...robots });

      if (event.type === "ROBOT_MOVE_INITIATED") {
        const { origin, destination, travelTime } = event;
        const getPosition = () => robot.position;
        const setPosition = (position: number) => {
          robot.position = position;
          setRobots({ ...robots });
        };
        updateRobotPositionAllAlongTheWay(
          origin,
          destination,
          travelTime,
          getPosition,
          setPosition,
        );
      }
    };
  }

  function visualStatus(status: RobotStatus): RobotVisualStatus {
    switch (status) {
      case "WAITING":
      case "MOVING":
        return "UNPRODUCTIVE";

      case "MINING_FOO":
      case "MINING_BAR":
      case "ASSEMBLING_FOOBAR":
      case "SELLING_FOOBARS":
      case "BUYING_ROBOT":
        return "PRODUCTIVE";
    }
  }

  function updateRobotPositionAllAlongTheWay(
    origin: "PARKING" | Workstation,
    destination: Workstation,
    travelTime: number,
    getPosition: () => number,
    setPosition: (position: number) => void,
  ): void {
    const originalPosition = computePosition(origin);
    const finalPosition = computePosition(destination);
    const refreshDelayInMs = 100;
    const timerId = uuid();

    const timer = setInterval(() => {
      const stepCount = travelTime / speedUpFactor / refreshDelayInMs;
      const stepChars = (finalPosition - originalPosition) / stepCount;
      const position = getPosition() + stepChars;
      if (
        (finalPosition > originalPosition && position >= finalPosition) ||
        (finalPosition < originalPosition && position <= finalPosition)
      ) {
        clearInterval(timer);
        delete timers[timerId];
      }
      setPosition(position);
    }, refreshDelayInMs);
    timers[timerId] = timer;
  }

  function computePosition(location: "PARKING" | Workstation): number {
    const workstationIndex = Object.keys(ORDERED_WORKSTATION_LABELS).findIndex(
      (s: string) => s === location,
    );
    return (
      workstationIndex * WORKSTATION_SPACE_IN_CHARS +
      // divided by 2 to center the robot with the column/label
      (WORKSTATION_SPACE_IN_CHARS - ROBOT_CHAR_WIDTH) / 2
    );
  }

  return (
    <Box flexDirection="column">
      <WorkstationLabels />
      <ExistingRobots robots={Object.values(robots)} />
      <FutureRobotsSpace
        robots={Object.values(robots)}
        expectedRobotCount={expectedRobotCount}
      />
    </Box>
  );
}

function WorkstationLabels(): ReactElement {
  return (
    <Box flexDirection="row">
      <Box marginBottom={1} width={5} />
      {Object.values(ORDERED_WORKSTATION_LABELS).map((label: string) => (
        <Box
          key={label}
          marginBottom={1}
          width={WORKSTATION_SPACE_IN_CHARS}
          justifyContent={"center"}
        >
          <Text color="white">{label}</Text>
        </Box>
      ))}
    </Box>
  );
}

interface ExistingRobotsProps {
  robots: Robot[];
}

function ExistingRobots({
  robots,
}: ExistingRobotsProps): ReactElement<ExistingRobotsProps> {
  return (
    <>
      {robots.map((robot: Robot) => (
        <Robot key={robot.id} robot={robot} />
      ))}
    </>
  );
}

interface RobotProps {
  robot: Robot;
}

function Robot({
  robot: { id, position, visualStatus },
}: RobotProps): ReactElement<RobotProps> {
  const leftSpace = " ".repeat(position); // to position the robot
  const removePrefix = (id: string) => id.split("-")[1]; // e.g. ROBOT-42 => 42
  return (
    <Box flexDirection="row">
      <Box width={5}>
        <Text color="white">#{removePrefix(id)}</Text>
      </Box>
      {visualStatus === "UNPRODUCTIVE" && (
        <Text color="white">
          {leftSpace}
          {ROBOT_CHAR}
        </Text>
      )}
      {visualStatus === "PRODUCTIVE" && (
        <>
          <Text color="white">{leftSpace}</Text>
          <Spinner type="point" />
        </>
      )}
    </Box>
  );
}

interface FutureRobotsSpaceProps {
  robots: Robot[];
  expectedRobotCount: number;
}

function FutureRobotsSpace({
  robots,
  expectedRobotCount,
}: FutureRobotsSpaceProps): ReactElement<FutureRobotsSpaceProps> {
  return (
    <>
      {Array.from(Array(expectedRobotCount - robots.length).keys()).map((i) => (
        <Box key={i} flexDirection="row">
          <Box width={5}>
            <Text color="white">#-</Text>
          </Box>
        </Box>
      ))}
    </>
  );
}

export default Activity;
