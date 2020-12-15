import React from "react";
import { render } from "ink";
import readline from "readline";
import { promisify } from "util";
import Dashboard from "./Dashboard";
import { SubscribeEvent, UnsubscribeEvent } from "../events";
import clock from "../clock";

export async function runTerminalInterface(
  subscribeEvent: SubscribeEvent,
  unsubscribeEvent: UnsubscribeEvent,
  runFactory: () => void,
  expectedRobotCount: number,
): Promise<void> {
  if (await screenRequirementIsMeetOrUserWantToProceed()) {
    const speedUpFactor = await speedUpFactorUserInput();
    clock.setSpeedUpFactor(speedUpFactor);
    render(
      <Dashboard
        subscribeEvent={subscribeEvent}
        unsubscribeEvent={unsubscribeEvent}
        runFactory={runFactory}
        expectedRobotCount={expectedRobotCount}
        // the speed up factor could be an event (cf events.ts)
        // instead of a props of the parent componet
        speedUpFactor={speedUpFactor}
      />,
    );
  } else {
    process.exit();
  }
}

/**
 * Allow to provide a speed up factor from a terminal argument or asking the user interactively.
 *
 * Allowing to update the speed up factor during the game with some keyboards would be cool.
 * But I expect it is not that trivial because of the use of the Node setTimeout and setInterval.
 *
 * Possible improvement: use the package yargs https://www.npmjs.com/package/yargs
 */
async function speedUpFactorUserInput(): Promise<number> {
  const parseSpeedUpFactor = (input: string): number | null => {
    const factor = Number.parseInt(input, 10);
    return 1 <= factor && factor <= 10 ? factor : null;
  };
  const userInput =
    // the 1st argument is Node, 2nd the script & 3rd one could be the factor.
    process.argv.length >= 3
      ? process.argv[2]
      : await question(
          "This interface allows to speed up the game. What speed factor do you want ? (integer between 1 and 10) ",
        );
  return parseSpeedUpFactor(userInput) || 1;
}

async function screenRequirementIsMeetOrUserWantToProceed(): Promise<boolean> {
  const minimumScreenColumnCount = 100;
  const minimumScreenRowCount = 51;
  const start =
    process.stdout.columns < minimumScreenColumnCount ||
    process.stdout.rows < minimumScreenRowCount
      ? (
          await question(
            `For a correct display, this program require a screen of miniumm ${minimumScreenColumnCount} columns and ${minimumScreenRowCount} rows.
However, your current terminal screen has ${process.stdout.columns} columns and ${process.stdout.rows} rows.
To meet this requirement, you may have to increase the size of your terminal window and/or decrease the text size (Mac OSX shortcut: ⌘-).
Do you want to continue anyway ? Y/[N] `,
          )
        ).toUpperCase() === "Y"
      : true;
  return start;
}

async function question(question: string): Promise<string> {
  return promisify((callback: (err: null, answer: string) => void): void =>
    readline
      .createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      .question(question, (answer: string) => callback(null, answer)),
  )();
}
