# js-operator-overloading

This is a simple transformer built with babel that enables operator overloading in JavaScript/TypeScript using `Symbol.for(operator)`. On the transformed code, it adds a helper function `__applyOperator` that checks if the left operand has a method corresponding to the operator symbol. If it does, it calls that method; otherwise, it falls back to the default operation.

## Example

```ts
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
```

The above code will be transformed to:

<!-- prettier-ignore -->
```ts
function __applyOperator(op, left, right, defaultExpr) {
  return left != null && typeof left[op] === "function" ? left[op](right) : defaultExpr();
}
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
```

You can verify it by running `bun demo` command.

# Installation

To install dependencies:

```bash
bun install
```

To run:

```bash
bun example
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
