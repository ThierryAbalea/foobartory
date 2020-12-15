import TinyQueue from "tinyqueue";

let currentTime = 0;

function getTime(): number {
  return currentTime;
}

function setTime(time: number): void {
  currentTime = time;
  triggerTimers();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setSpeedUpFactor(factor: number): void {
  throw new Error(
    `setSpeedUpFactor function is not supposed to be called when the fake clock is used.
The alternative clock is the system one (cf useFakeClock function)`,
  );
}

interface Timer {
  order: number;
  triggerTime: number;
  callback: () => void;
}

/**
 * Timers are stored in a Priority Queue.
 * The priority corresponds to the chronogical order of the timers, based on the trigger time.
 * Computer Science reminder: a Priority Queue is an Abstract Data Type (basically, an interface).
 * The package tinyqueue rely on a Binary Heap data structure for the implementation of this ADT.
 */
const chronologicalOrder = (a: Timer, b: Timer) =>
  a.triggerTime - b.triggerTime;
const timersQueue = new TinyQueue<Timer>([], chronologicalOrder);

let nextTimerOrder = 0;

function setTimeout(callback: () => void, delayInMs: number): void {
  if (delayInMs === 0) {
    // let's execute the callback immediately
    callback();
  } else {
    timersQueue.push({
      order: nextTimerOrder,
      triggerTime: getTime() + delayInMs,
      callback,
    });
    nextTimerOrder++;

    const timer = timersQueue.peek();
    if (timer) {
      const triggerTime = timer.triggerTime;
      global.setTimeout(() => {
        setTime(triggerTime);
      }, 0);
    }
  }
}

function triggerTimers(): void {
  let timer;
  const timers: Timer[] = [];
  while (
    (timer = timersQueue.peek()) &&
    timer &&
    timer.triggerTime <= getTime()
  ) {
    timersQueue.pop();
    timers.push(timer);
  }
  timers.sort((a: Timer, b: Timer) => a.order - b.order);
  timers.forEach((timer) => {
    timer.callback();
  });
}

export default {
  getTime,
  setTime,
  setTimeout,
  setSpeedUpFactor,
};
