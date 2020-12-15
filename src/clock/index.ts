import fakeClock from "./fakeClock";
import systemClock from "./systemClock";

const defaultClock = systemClock;

let clock = defaultClock;

export function useFakeClock(): void {
  clock = fakeClock;
}

export function useSystemClock(): void {
  clock = systemClock;
}

export default {
  getTime: (): number => clock.getTime(),
  setTime: (time: number): void => clock.setTime(time),
  setTimeout: (callback: () => void, delayInMs: number): void =>
    clock.setTimeout(callback, delayInMs),
  setSpeedUpFactor: (factor: number): void => clock.setSpeedUpFactor(factor),
};
