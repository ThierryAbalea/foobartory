[![Actions Status](https://github.com/ThierryAbalea/foobartory/workflows/Node%20CI/badge.svg)](https://github.com/ThierryAbalea/foobartory/actions)

# Alma Technical Test - foobartory - Thierry ABALEA’s solution proposal

# instructions

[original technical test instructions (in french)](instructions.md)

# prerequisites

- install [Node.js](https://nodejs.org). A good practice is to first install [nvm](https://github.com/nvm-sh/nvm) to be able to manage multiple Node.js version (via [brew](https://brew.sh/) or the [nvm script](https://github.com/nvm-sh/nvm#install--update-script))

# run & debug

## run tests

- after cloning, run once: `npm install`
- `npm test` (alternatively, run `npm run test:watch` to continuously run the tests when editing the code)

## run the rich command-line interface

- run `npm start`
- optionally you could pass in argument a speed up factor (integer from 1 to 10): `npm start 10`

![interface preview](https://media.giphy.com/media/3pSeoyILZGCS1r2U45/giphy.gif)

## debugging with hot reload the interface

- run in one terminal `npm run watch-ts`
- run in a second one `npm run watch-node`

# (lack of) optimisation

Due to lack of time, the scheduler implementation is largely sub-optimal. I basically craft a quick & dirty strategy that meet the requirement (to reach the objective of 30 robots in finite time) for the 2 initial robots. Then I replicate the same strategy for all the new coming robots.

I have optmisation ideas that could be discuss during a coming interview if you want. I am also motivated to implement one of my idea in the near future.

# TODO / TOFIX

In addition of the scheduling optimisation, some possible improvements on top of my head:

- fix the React memory leak that happen sometimes at the end of the game.
- improve the layout of the interface (e.g. provide fixed-size for the counter columns)
- fix flaky tests in the test module `runner.ts`
- add missing tests on selling & buying actions
- add some tests in the interface (maybe use the package ink-testing-library)
