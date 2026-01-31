// @ts-ignore
Number.prototype[Symbol.for('+')] = function () {
  return 5;
};

const value = 2 + 2;
console.log(value);
