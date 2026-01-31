import { Matrix } from './matrix';

const first = new Matrix([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]);

const second = new Matrix([
  [9, 8, 7],
  [6, 5, 4],
  [3, 2, 1],
]);

// @ts-ignore
console.log(first + (second * (second - first)) / first);

const third = new Matrix([
  [4, 0],
  [1, -9],
]);

// @ts-ignore
console.log(third * 2);
