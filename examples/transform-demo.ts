import { transform } from '../src/transform';

const maybeFile = process.argv[2];
const isTypeScript = maybeFile?.endsWith('.ts') || maybeFile?.endsWith('.tsx');
const source = maybeFile
  ? await Bun.file(maybeFile).text()
  : `
class Value {
    constructor(value) {
      this.value = value;
    }

    [Symbol.for('+')](other) {
        return new Value(this.value + other.value);
    }
}

const a = new Value(10);
const b = new Value(20);
const c = a + b;
console.log(c.value); // 30
`;

const result = transform(source, {
  sourceType: 'module',
  typescript: isTypeScript,
  jsx: false,
});

await Bun.write(
  `./examples/transformed.${
    maybeFile?.endsWith('.ts') || maybeFile?.endsWith('.tsx') ? 'ts' : 'js'
  }`,
  result.code
);
