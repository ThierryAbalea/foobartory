import { Robot } from "./Robot";
import {
  fooAddedToInventory,
  fooRemovedFromInventory,
  barAddedToInventory,
  barRemovedFromInventory,
  foobarAddedToInventory,
  foobarRemovedFromInventory,
  robotParked,
  moneyWon,
  moneySpent,
} from "./eventBuilders";
import { Event } from "./events";
import { Bar, Foo, Foobar } from "./inventory";
import clock from "./clock";

export class Factory {
  private readonly robots: Robot[] = [];
  private readonly foos: Foo[] = [];
  private readonly bars: Bar[] = [];
  private readonly foobars: Foobar[] = [];
  private money = 0;
  private readonly eventSubscribers: Record<
    string,
    (event: Event) => void
  > = {};

  public readonly newRobotId = newSerialNumberGenerator("ROBOT-");
  public readonly newFooSerialNumber = newSerialNumberGenerator("FOO-");
  public readonly newBarSerialNumber = newSerialNumberGenerator("BAR-");
  public readonly newFoobarSerialNumber = newSerialNumberGenerator("FOOBAR-");

  static createFactory(): Factory {
    return new Factory();
  }

  setup(initialRobotCount: number): void {
    while (initialRobotCount > 0) {
      this.newRobot();
      initialRobotCount--;
    }
  }

  newRobot(): Robot {
    const robot = Robot.createRobot({ factory: this });
    this.parkRobot(robot);
    return robot;
  }

  parkRobot(robot: Robot): void {
    this.robots.push(robot);
    this.publishEvent(robotParked(robot));
  }

  get availableRobots(): Robot[] {
    return this.robots;
  }

  addFooToInventory(robot: Robot, foo: Foo): void {
    this.foos.push(foo);
    this.publishEvent(fooAddedToInventory(robot, foo));
  }

  popFooFromInventory(robot: Robot): Foo {
    const foo = <Foo>this.foos.pop();
    this.publishEvent(fooRemovedFromInventory(robot, foo));
    return foo;
  }

  get availableFoos(): Foo[] {
    return this.foos;
  }

  addBarToInventory(robot: Robot, foo: Bar): void {
    this.bars.push(foo);
    this.publishEvent(barAddedToInventory(robot, foo));
  }

  popBarFromInventory(robot: Robot): Bar {
    const bar = <Bar>this.bars.pop();
    this.publishEvent(barRemovedFromInventory(robot, bar));
    return bar;
  }

  get availableBars(): Bar[] {
    return this.bars;
  }

  addFoobarToInventory(robot: Robot, foobar: Foobar): void {
    this.foobars.push(foobar);
    this.publishEvent(foobarAddedToInventory(robot, foobar));
  }

  popFoobarFromInventory(robot: Robot): Foobar {
    const foobar = <Foobar>this.foobars.pop();
    this.publishEvent(foobarRemovedFromInventory(robot, foobar));
    return foobar;
  }

  get availableFoobars(): Foobar[] {
    return this.foobars;
  }

  addMoney(robot: Robot, amount: number): void {
    this.money += amount;
    this.publishEvent(moneyWon(robot, amount));
  }

  removeMoney(robot: Robot, amount: number): void {
    this.money -= amount;
    this.publishEvent(moneySpent(robot, amount));
  }

  get availableMoney(): number {
    return this.money;
  }

  subscribeEvent(subscriberId: string, onEvent: (event: Event) => void): void {
    this.eventSubscribers[subscriberId] = onEvent;
  }

  unsubscribeEvent(subscriberId: string): void {
    delete this.eventSubscribers[subscriberId];
  }

  publishEvent(event: Event): void {
    // publishEvent trigger indirectly calls to itself in the case of the run function.
    // It means we can easily encounter the following error:
    //   RangeError: Maximum call stack size exceeded
    // Let release the event loop by setting a timeout of 0 ms.
    clock.setTimeout(() => {
      Object.values(this.eventSubscribers).forEach((s) => s(event));
    }, 0);
  }
}

function newSerialNumberGenerator(
  serialNumberPrefix: string,
  nextNumber = 1,
): () => string {
  return (): string => {
    const number = nextNumber;
    nextNumber++;
    return `${serialNumberPrefix}${number}`;
  };
}
