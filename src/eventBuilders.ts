import { Robot } from "./Robot";
import clock from "./clock";
import {
  BarAddedToInventory,
  BarMined,
  BarMiningInitiated,
  BarRemovedFromInventory,
  FoobarAddedToInventory,
  FoobarAssembled,
  FoobarAssemblingFailed,
  FoobarAssemblingInitiated,
  FoobarRemovedFromInventory,
  FooAddedToInventory,
  FooMined,
  FooMiningInitiated,
  FooRemovedFromInventory,
  RobotArrived,
  RobotMoveInitiated,
  RobotParked,
  Workstation,
  FoobarsSalesInitiated,
  FoobarsSold,
  RobotPurchaseInitiated,
  RobotPurchased,
  MoneyWon,
  MoneySpent,
} from "./events";
import { Bar, Foo, Foobar } from "./inventory";

export function robotParked({
  id: robotId,
  status: robotStatus,
}: Robot): RobotParked {
  return {
    type: "ROBOT_PARKED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    location: "PARKING",
  };
}

export function robotMoveInitiated(
  { id: robotId, status: robotStatus }: Robot,
  origin: "PARKING" | Workstation,
  destination: Workstation,
  travelTimeInMs: number,
): RobotMoveInitiated {
  return {
    type: "ROBOT_MOVE_INITIATED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    origin,
    destination,
    travelTime: travelTimeInMs,
  };
}

export function robotArrived(
  { id: robotId, status: robotStatus }: Robot,
  newLocation: Workstation,
): RobotArrived {
  return {
    type: "ROBOT_ARRIVED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    newLocation,
  };
}

export function fooMiningInitiated({
  id: robotId,
  status: robotStatus,
}: Robot): FooMiningInitiated {
  return {
    type: "FOO_MINING_INITIATED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
  };
}

export function fooMined(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Foo,
): FooMined {
  return {
    type: "FOO_MINED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function fooAddedToInventory(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Foo,
): FooAddedToInventory {
  return {
    type: "FOO_ADDED_TO_INVENTORY",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function fooRemovedFromInventory(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Foo,
): FooRemovedFromInventory {
  return {
    type: "FOO_REMOVED_FROM_INVENTORY",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function barMiningInitiated({
  id: robotId,
  status: robotStatus,
}: Robot): BarMiningInitiated {
  return {
    type: "BAR_MINING_INITIATED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
  };
}

export function barMined(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Bar,
): BarMined {
  return {
    type: "BAR_MINED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function barAddedToInventory(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Bar,
): BarAddedToInventory {
  return {
    type: "BAR_ADDED_TO_INVENTORY",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function barRemovedFromInventory(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Bar,
): BarRemovedFromInventory {
  return {
    type: "BAR_REMOVED_FROM_INVENTORY",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function foobarAssemblingInitiated(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber: fooSerialNumber }: Foo,
  { serialNumber: barSerialNumber }: Bar,
): FoobarAssemblingInitiated {
  return {
    type: "FOOBAR_ASSEMBLING_INITIATED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    fooSerialNumber,
    barSerialNumber,
  };
}

export function foorbarAssembled(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber, fooSerialNumber, barSerialNumber }: Foobar,
): FoobarAssembled {
  return {
    type: "FOOBAR_ASSEMBLED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
    fooSerialNumber,
    barSerialNumber,
  };
}

export function foorbarAssemblingFailed(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber: fooSerialNumber }: Foo,
  { serialNumber: barSerialNumber }: Bar,
): FoobarAssemblingFailed {
  return {
    type: "FOOBAR_ASSEMBLING_FAILED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    fooSerialNumber,
    barSerialNumber,
  };
}

export function foobarAddedToInventory(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Foobar,
): FoobarAddedToInventory {
  return {
    type: "FOOBAR_ADDED_TO_INVENTORY",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function foobarRemovedFromInventory(
  { id: robotId, status: robotStatus }: Robot,
  { serialNumber }: Foobar,
): FoobarRemovedFromInventory {
  return {
    type: "FOOBAR_REMOVED_FROM_INVENTORY",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumber,
  };
}

export function foobarsSalesInitiated(
  { id: robotId, status: robotStatus }: Robot,
  foobars: Foobar[],
): FoobarsSalesInitiated {
  return {
    type: "FOOBARS_SALES_INITIATED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumbers: foobars.map(({ serialNumber }) => serialNumber),
  };
}

export function foobarsSold(
  { id: robotId, status: robotStatus }: Robot,
  foobars: Foobar[],
): FoobarsSold {
  return {
    type: "FOOBARS_SOLD",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    serialNumbers: foobars.map(({ serialNumber }) => serialNumber),
  };
}

export function robotPurchaseInitiated({
  id: robotId,
  status: robotStatus,
}: Robot): RobotPurchaseInitiated {
  return {
    type: "ROBOT_PURCHASE_INITIATED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
  };
}

export function robotPurchased(
  { id: robotId, status: robotStatus }: Robot,
  boughtRobot: Robot,
): RobotPurchased {
  return {
    type: "ROBOT_PURCHASED",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    boughtRobotId: boughtRobot.id,
  };
}

export function moneyWon(
  { id: robotId, status: robotStatus }: Robot,
  amount: number,
): MoneyWon {
  return {
    type: "MONEY_WON",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    amount,
  };
}

export function moneySpent(
  { id: robotId, status: robotStatus }: Robot,
  amount: number,
): MoneySpent {
  return {
    type: "MONEY_SPENT",
    timestamp: clock.getTime(),
    robotId,
    robotStatus,
    amount,
  };
}
