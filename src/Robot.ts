import clock from "./clock";
import {
  barMined,
  barMiningInitiated,
  foobarAssemblingInitiated,
  foobarsSalesInitiated,
  foobarsSold,
  fooMined,
  fooMiningInitiated,
  foorbarAssembled,
  foorbarAssemblingFailed,
  robotArrived,
  robotMoveInitiated,
  robotPurchased,
  robotPurchaseInitiated,
} from "./eventBuilders";
import { Location, RobotStatus, Workstation } from "./events";
import { Factory } from "./Factory";
import { Foobar } from "./inventory";
import { bernoulli, getRandomIntInclusive } from "./random";

export interface RobotProps {
  id: string;
  status: RobotStatus;
  location: Location;
  destination?: Workstation; // only present when status is MOVING and location is IN_TRANSIT
  factory: Factory;
}

export class Robot {
  id: string;
  status: RobotStatus;
  location: Location;
  destination?: Workstation; // only present when status is MOVING and location is IN_TRANSIT
  factory: Factory;

  private constructor({ id, status, location, factory }: RobotProps) {
    this.id = id;
    this.status = status;
    this.location = location;
    this.factory = factory;
  }

  static createRobot(
    partialRobot: Partial<RobotProps> & { factory: Factory },
  ): Robot {
    return new Robot({
      id: partialRobot.factory.newRobotId(),
      status: "WAITING",
      location: "PARKING",
      ...partialRobot,
    });
  }

  moveToWorkstation(
    destination: Workstation,
    doWhenDestinationIsReached: () => void = this.doNothing,
  ): void {
    if (this.location === "IN_TRANSIT") {
      // present mistake of the scheduler, like trying to move an already moving robot.
      throw new Error("The current move must be completed before any new move");
    }
    const travelTimeInMs = 5000;
    const origin = this.location;
    this.status = "MOVING";
    this.location = "IN_TRANSIT";
    this.destination = destination;
    this.factory.publishEvent(
      robotMoveInitiated(this, origin, destination, travelTimeInMs),
    );
    clock.setTimeout(() => {
      this.status = "WAITING";
      this.destination = undefined;
      this.location = destination;
      this.factory.publishEvent(robotArrived(this, destination));
      doWhenDestinationIsReached();
    }, travelTimeInMs);
  }

  mineFoo(): void {
    this.moveIfNecessearyAndDo("FOO_MINING_WORKSTATION", () => {
      this.status = "MINING_FOO";
      this.factory.publishEvent(fooMiningInitiated(this));
      clock.setTimeout(() => {
        const foo = { serialNumber: this.factory.newFooSerialNumber() };
        this.factory.addFooToInventory(this, foo);
        this.status = "WAITING";
        this.factory.publishEvent(fooMined(this, foo));
      }, 1000);
    });
  }

  mineBar(): void {
    this.moveIfNecessearyAndDo("BAR_MINING_WORKSTATION", () => {
      this.status = "MINING_BAR";
      this.factory.publishEvent(barMiningInitiated(this));
      const delayToMine = getRandomIntInclusive(500, 2000);
      clock.setTimeout(() => {
        const bar = { serialNumber: this.factory.newBarSerialNumber() };
        this.factory.addBarToInventory(this, bar);
        this.status = "WAITING";
        this.factory.publishEvent(barMined(this, bar));
      }, delayToMine);
    });
  }

  assembleFoobar(): void {
    this.moveIfNecessearyAndDo("FOOBAR_ASSEMBLING_WORKSTATION", () => {
      if (
        this.factory.availableFoos.length > 0 &&
        this.factory.availableBars.length > 0
      ) {
        this.status = "ASSEMBLING_FOOBAR";
        // the foo and the bar used to assemble a foobar must be removed from
        // the inventory at the begin of the assembling to avoid multiple robots
        // assembling the same raw materials in parallel.
        const foo = this.factory.popFooFromInventory(this);
        const bar = this.factory.popBarFromInventory(this);
        this.factory.publishEvent(foobarAssemblingInitiated(this, foo, bar));
        clock.setTimeout(() => {
          // the assembling operation has a probability of success of 60%.
          const success = bernoulli(0.6);
          if (success) {
            const foobar = {
              serialNumber: this.factory.newFoobarSerialNumber(),
              fooSerialNumber: foo.serialNumber,
              barSerialNumber: bar.serialNumber,
            };
            this.factory.addFoobarToInventory(this, foobar);
            this.status = "WAITING";
            this.factory.publishEvent(foorbarAssembled(this, foobar));
          } else {
            this.factory.addBarToInventory(this, bar);
            this.status = "WAITING";
            this.factory.publishEvent(foorbarAssemblingFailed(this, foo, bar));
          }
        }, 2000);
      }
    });
  }

  /**
   * WARNING: the sales may have a duration of 10s multiplied by the number of foobars to sell !
   * Be sure enough foobars are available from the start or the foobar producing troughtput is sufficient.
   *
   * This method allow to sell any number of foobars.
   * All foobars are sold in a single sales (only 1 FOOBARS_SALES_INITIATED & 1 FOOBARS_SOLD).
   * However, the time to sell all of them is proportial to their number.
   * E.g. 1 foobar => 10s, 5 foobars => 10s, 6 foobars => 20s, 11 foobars => 30s
   * The number of foobars available may be inferior to the number of foobars to sell
   * at the beginning of the sales. This does not prevent the sell.
   * For example, if the number to sell is 10 and there is only 1 foobar available, 1 foobar
   * will be sold. 10s later the sales continue if there is at least one new foobar.
   * If there is no available foobar at any moment, the sales don't happen or is stopped.
   * The robot does not wait the availability of foobars.
   * If there is only 1 foobar produce every 10s and the number of foobar to sell is 10,
   * the robot will spent 100s to sell 10 foobars.
   *
   * @param foobarToSellCount any positive number corresponding to the number of foobars to sell.
   */
  sellFoobars(foobarToSellCount: number): void {
    this.moveIfNecessearyAndDo("FOOBAR_SELLING_WORKSTATION", () => {
      this._sellFoobars([], foobarToSellCount);
    });
  }

  /**
   * _sellFoobars is a recursive method with an accumulator corresponding
   * to the foobars sold by previous calls of this method.
   */
  private _sellFoobars(
    previousSoldFoobars: Foobar[],
    foobarToSellCount: number,
  ): void {
    const maxSellableCount = Math.min(this.factory.availableFoobars.length, 5);
    const readyToSellCount = Math.min(foobarToSellCount, maxSellableCount);
    if (readyToSellCount > 0) {
      this.status = "SELLING_FOOBARS";
      // the foobar must be removed from the inventory at the begin of the sells
      // to avoid multiple robots selling the same foobars in parallel.
      const soldFoobars = Array.from({ length: readyToSellCount }, () => {
        return this.factory.popFoobarFromInventory(this);
      });
      this.factory.publishEvent(foobarsSalesInitiated(this, soldFoobars));
      clock.setTimeout(() => {
        this.factory.addMoney(this, soldFoobars.length);
        const remainingCount = Math.min(
          foobarToSellCount - soldFoobars.length,
          0,
        );
        previousSoldFoobars.push(...soldFoobars);
        this._sellFoobars(previousSoldFoobars, remainingCount);
      }, 10000);
    } else if (previousSoldFoobars.length > 0) {
      this.status = "WAITING";
      this.factory.publishEvent(foobarsSold(this, previousSoldFoobars));
    }
  }

  buyRobot(): void {
    this.moveIfNecessearyAndDo("ROBOT_BUYING_WORKSTATION", () => {
      if (
        this.factory.availableFoos.length >= 6 &&
        this.factory.availableMoney >= 3
      ) {
        this.status = "BUYING_ROBOT";
        this.factory.publishEvent(robotPurchaseInitiated(this));
        this.factory.removeMoney(this, 3);
        Array.from({ length: 6 }, () => {
          return this.factory.popFooFromInventory(this);
        });
        const boughtRobot = this.factory.newRobot();
        this.status = "WAITING";
        this.factory.publishEvent(robotPurchased(this, boughtRobot));
      }
    });
  }

  private moveIfNecessearyAndDo(
    destination: Workstation,
    doWhenDestinationIsReached: () => void,
  ): void {
    if (this.location === destination) {
      doWhenDestinationIsReached();
    } else {
      this.moveToWorkstation(destination, doWhenDestinationIsReached);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  doNothing(): void {}
}
