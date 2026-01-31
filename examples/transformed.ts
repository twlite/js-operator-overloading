function __applyOperator(op, left, right, defaultExpr) {
  return left != null && typeof left[op] === "function" ? left[op](right) : defaultExpr();
}
// @ts-nocheck
class Value {
  constructor(public val: number) {}
  [Symbol.for('*')](other: Value) {
    return new Value(__applyOperator(Symbol.for("*"), this.val, other.val, () => this.val * other.val)); // Custom multiplication logic
  }
}
const a = new Value(5);
const b = new Value(10);
const result = __applyOperator(Symbol.for("*"), a, b, () => a * b); // Uses overloaded '*' operator
console.log(result.val); // Outputs: 50