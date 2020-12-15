export type RobotStatus =
  | "WAITING" // just after robot was bought or between two actions (moving, mining, ...)
  | "MOVING"
  | "MINING_FOO"
  | "MINING_BAR"
  | "ASSEMBLING_FOOBAR"
  | "SELLING_FOOBARS"
  | "BUYING_ROBOT";

export type Location =
  | "PARKING" // just after robot was bought
  | "IN_TRANSIT" // between 2 locations (e.g. between the parking and the foo mining workstation)
  | Workstation;

export type Workstation =
  | "FOO_MINING_WORKSTATION"
  | "BAR_MINING_WORKSTATION"
  | "FOOBAR_ASSEMBLING_WORKSTATION"
  | "FOOBAR_SELLING_WORKSTATION"
  | "ROBOT_BUYING_WORKSTATION";

export type SubscribeEvent = (
  subscriberId: string,
  onEvent: (event: Event) => void,
) => void;

export type UnsubscribeEvent = (subscriberId: string) => void;

export type Event =
  | RobotParked
  | RobotMoveInitiated
  | RobotArrived
  | FooMiningInitiated
  | FooMined
  | FooAddedToInventory
  | FooRemovedFromInventory
  | BarMiningInitiated
  | BarMined
  | BarAddedToInventory
  | BarRemovedFromInventory
  | FoobarAssemblingInitiated
  | FoobarAssembled
  | FoobarAssemblingFailed
  | FoobarAddedToInventory
  | FoobarRemovedFromInventory
  | FoobarsSalesInitiated
  | FoobarsSold
  | RobotPurchaseInitiated
  | RobotPurchased
  | MoneyWon
  | MoneySpent;

interface BaseEvent {
  type: string;
  timestamp: number;
  robotId: string;
  robotStatus: RobotStatus;
}

export type RobotParked = BaseEvent & {
  type: "ROBOT_PARKED";
  location: "PARKING";
};

export type RobotMoveInitiated = BaseEvent & {
  type: "ROBOT_MOVE_INITIATED";
  origin: "PARKING" | Workstation;
  destination: Workstation;
  travelTime: number;
};

export type RobotArrived = BaseEvent & {
  type: "ROBOT_ARRIVED";
  newLocation: Workstation;
};

export type FooMiningInitiated = BaseEvent & {
  type: "FOO_MINING_INITIATED";
};

export type FooMined = BaseEvent & {
  type: "FOO_MINED";
  serialNumber: string;
};

export type FooAddedToInventory = BaseEvent & {
  type: "FOO_ADDED_TO_INVENTORY";
  serialNumber: string;
};

export type FooRemovedFromInventory = BaseEvent & {
  type: "FOO_REMOVED_FROM_INVENTORY";
  serialNumber: string;
};

export type BarMiningInitiated = BaseEvent & {
  type: "BAR_MINING_INITIATED";
};

export type BarMined = BaseEvent & {
  type: "BAR_MINED";
  serialNumber: string;
};

export type BarAddedToInventory = BaseEvent & {
  type: "BAR_ADDED_TO_INVENTORY";
  serialNumber: string;
};

export type BarRemovedFromInventory = BaseEvent & {
  type: "BAR_REMOVED_FROM_INVENTORY";
  serialNumber: string;
};

export type FoobarAssemblingInitiated = BaseEvent & {
  type: "FOOBAR_ASSEMBLING_INITIATED";
  fooSerialNumber: string;
  barSerialNumber: string;
};

export type FoobarAssembled = BaseEvent & {
  type: "FOOBAR_ASSEMBLED";
  serialNumber: string;
  fooSerialNumber: string;
  barSerialNumber: string;
};

export type FoobarAssemblingFailed = BaseEvent & {
  type: "FOOBAR_ASSEMBLING_FAILED";
  fooSerialNumber: string;
  barSerialNumber: string;
};

export type FoobarAddedToInventory = BaseEvent & {
  type: "FOOBAR_ADDED_TO_INVENTORY";
  serialNumber: string;
};

export type FoobarRemovedFromInventory = BaseEvent & {
  type: "FOOBAR_REMOVED_FROM_INVENTORY";
  serialNumber: string;
};

export type FoobarsSalesInitiated = BaseEvent & {
  type: "FOOBARS_SALES_INITIATED";
  serialNumbers: string[];
};

export type FoobarsSold = BaseEvent & {
  type: "FOOBARS_SOLD";
  serialNumbers: string[];
};

export type RobotPurchaseInitiated = BaseEvent & {
  type: "ROBOT_PURCHASE_INITIATED";
};

export type RobotPurchased = BaseEvent & {
  type: "ROBOT_PURCHASED";
  boughtRobotId: string;
};

export type MoneyWon = BaseEvent & {
  type: "MONEY_WON";
  amount: number;
};

export type MoneySpent = BaseEvent & {
  type: "MONEY_SPENT";
  amount: number;
};
