import React, { useEffect, ReactElement } from "react";
import { Box, useApp, useInput, useStdin } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import Divider from "ink-divider";
import { SubscribeEvent, UnsubscribeEvent } from "../events";
import Statistics from "./Statistics";
import Inventory from "./Inventory";
import Activity from "./Activity";
import Clock from "./Clock";

export interface DashboardProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
  runFactory: () => void;
  expectedRobotCount: number;
  speedUpFactor: number;
}

function Dashboard({
  subscribeEvent,
  unsubscribeEvent,
  runFactory,
  expectedRobotCount,
  speedUpFactor,
}: DashboardProps): ReactElement<DashboardProps> {
  const { isRawModeSupported } = useStdin();
  const { exit } = useApp();

  // We don't call explicitly this function in a useEffect hook.
  // If we do that, the first rendering will appear on the main screen and
  // will stay on this screen even after the end of the program.
  // We want to keep the main screen clean.
  // Everything must be displayed on the alternative full screen.
  enterInFullscreen();

  if (isRawModeSupported) {
    // Raw mode is supported when the program is executed with "npm start" but not with "npm run-watch".
    // Raw mode is required to use the hook useInput.
    // So, pressing the letter "q" to quit the program, is supported only for "npm start".
    // For "npm watch-mode", pressing CTRL+C (SIGINT signal) is required to quit the program.
    useInput((input) => {
      if (input === "q") {
        exit();
        onExit();
      }
    });
  }

  function enterInFullscreen(): void {
    const enterAltScreenCommand = "\x1b[?1049h";
    process.stdout.write(enterAltScreenCommand);
    // We explictly avoid to add also the statement: process.on("exit", onExit).
    // If we do that, in case of an error (during development for example), the function onExit
    // will be called and this function will leave the alternative screen containing the error.
    // Then, we will be unable to read the error.
    // However, the function onExit is called explicitly when the user press the letter "q" (cf useInput hook).
    process.on("SIGINT", onExit);
  }

  function onExit(): void {
    const leaveAltScreenCommand = "\x1b[?1049l";
    process.stdout.write(leaveAltScreenCommand);
    process.exit();
  }

  useEffect(() => {
    runFactory();
  });

  return (
    <Box flexDirection="column" marginLeft={2}>
      <Title />
      <Clock
        subscribeEvent={subscribeEvent}
        unsubscribeEvent={unsubscribeEvent}
        speedUpFactor={speedUpFactor}
      />
      <Section title={"Statistics"}>
        <Statistics
          subscribeEvent={subscribeEvent}
          unsubscribeEvent={unsubscribeEvent}
          expectedRobotCount={expectedRobotCount}
        />
      </Section>
      <Section title={"Inventory"}>
        <Inventory
          subscribeEvent={subscribeEvent}
          unsubscribeEvent={unsubscribeEvent}
        />
      </Section>
      <Section title={"Activity"}>
        <Activity
          subscribeEvent={subscribeEvent}
          unsubscribeEvent={unsubscribeEvent}
          expectedRobotCount={expectedRobotCount}
          speedUpFactor={speedUpFactor}
        />
      </Section>
    </Box>
  );
}

function Title(): ReactElement {
  return (
    <Box flexDirection="column">
      <Gradient name="mind">
        <BigText text="foobartory" />
      </Gradient>
    </Box>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({
  title,
  children,
}: SectionProps): ReactElement<SectionProps> {
  return (
    <>
      <Box flexDirection="column" marginLeft={-2}>
        <Divider title={title} width={98} />
      </Box>

      {children}
    </>
  );
}

export default Dashboard;
