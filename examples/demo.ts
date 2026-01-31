// @ts-nocheck
class Value {
  constructor(public val: number) {}

  [Symbol.for('*')](other: Value) {
    return new Value(this.val * other.val); // Custom multiplication logic
  }
}

const a = new Value(5);
const b = new Value(10);

const result = a * b; // Uses overloaded '*' operator
console.log(result.val); // Outputs: 50
