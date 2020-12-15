function getTime(): number {
  return Date.now();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setTime(time: number): void {
  throw new Error(
    `setTime function is not supposed to be called when the system clock is used.
If you want to control the time, use the fake clock by calling the function useFakeClock`,
  );
}

// 1 corresponds to normal speed
let speedUpFactor = 1;

function setSpeedUpFactor(factor: number): void {
  speedUpFactor = factor;
}

function setTimeout(callback: () => void, delayInMs: number): void {
  global.setTimeout(callback, delayInMs / speedUpFactor);
}

export default {
  getTime,
  setTime,
  setTimeout,
  setSpeedUpFactor,
};
