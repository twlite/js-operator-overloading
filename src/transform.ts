import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { types as t } from '@babel/core';

const OPERATOR_SYMBOLS = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '%': '%',
  '**': '**',
  '^': '^',
  '<': '<',
  '>': '>',
  '<=': '<=',
  '>=': '>=',
  '==': '==',
  '===': '===',
  '!=': '!=',
  '!==': '!==',
  '&': '&',
  '|': '|',
  '<<': '<<',
  '>>': '>>',
  '>>>': '>>>',
} as const;

interface TransformState {
  helperNeeded: boolean;
  helperName: string | null;
  insideHelper: boolean;
}

function generateHelperName(scope: any): string {
  let name = '__applyOperator';
  let counter = 0;

  while (scope.hasBinding(name)) {
    name = `__applyOperator_${Math.random().toString(36).substring(2, 9)}`;
    counter++;
    if (counter > 100) break;
  }

  return name;
}

function createHelperFunction(helperName: string) {
  // Generates: function __applyOperator(op, left, right, defaultExpr) {
  //   return left != null && typeof left[op] === "function" ? left[op](right) : defaultExpr();
  // }
  // Note: We use `left != null` (loose equality) to check for both null and undefined.
  // We don't use `in` operator because it doesn't work with primitives.
  // Property access like `left[op]` works for primitives due to auto-boxing.
  return t.functionDeclaration(
    t.identifier(helperName),
    [
      t.identifier('op'),
      t.identifier('left'),
      t.identifier('right'),
      t.identifier('defaultExpr'),
    ],
    t.blockStatement([
      t.returnStatement(
        t.conditionalExpression(
          t.logicalExpression(
            '&&',
            t.binaryExpression('!=', t.identifier('left'), t.nullLiteral()),
            t.binaryExpression(
              '===',
              t.unaryExpression(
                'typeof',
                t.memberExpression(
                  t.identifier('left'),
                  t.identifier('op'),
                  true
                )
              ),
              t.stringLiteral('function')
            )
          ),
          t.callExpression(
            t.memberExpression(t.identifier('left'), t.identifier('op'), true),
            [t.identifier('right')]
          ),
          t.callExpression(t.identifier('defaultExpr'), [])
        )
      ),
    ])
  );
}

function transformBinaryExpression(node: any, helperName: string): any {
  if (node.type !== 'BinaryExpression') {
    return node;
  }

  const { operator, left, right } = node;

  if (!OPERATOR_SYMBOLS[operator as keyof typeof OPERATOR_SYMBOLS]) {
    return node;
  }

  const operatorSymbol =
    OPERATOR_SYMBOLS[operator as keyof typeof OPERATOR_SYMBOLS];

  const symbolForCall = t.callExpression(
    t.memberExpression(t.identifier('Symbol'), t.identifier('for')),
    [t.stringLiteral(operatorSymbol)]
  );

  const transformedLeft = transformBinaryExpression(
    t.cloneNode(left, true),
    helperName
  );
  const transformedRight = transformBinaryExpression(
    t.cloneNode(right, true),
    helperName
  );

  const defaultExpr = t.arrowFunctionExpression(
    [],
    t.binaryExpression(operator, transformedLeft, transformedRight)
  );

  return t.callExpression(t.identifier(helperName), [
    symbolForCall,
    transformBinaryExpression(t.cloneNode(left, true), helperName),
    transformBinaryExpression(t.cloneNode(right, true), helperName),
    defaultExpr,
  ]);
}

export interface TransformOptions {
  sourceType?: 'script' | 'module' | 'unambiguous';
  typescript?: boolean;
  jsx?: boolean;
}

export interface TransformationResult {
  code: string;
  map: any;
}

export function transform(
  code: string,
  options: TransformOptions = {}
): TransformationResult {
  const { sourceType = 'module', typescript = false, jsx = false } = options;

  const ast = parse(code, {
    sourceType,
    plugins: [
      ...(typescript ? ['typescript' as const] : []),
      ...(jsx ? ['jsx' as const] : []),
    ],
  });

  const state: TransformState = {
    helperNeeded: false,
    helperName: null,
    insideHelper: false,
  };

  let helperFunctionPath: any = null;

  traverse(ast, {
    Program: {
      exit(path) {
        if (state.helperNeeded && state.helperName) {
          const helperFunc = createHelperFunction(state.helperName);
          const inserted = path.unshiftContainer('body', helperFunc);
          helperFunctionPath = inserted[0];
        }
      },
    },

    BinaryExpression(path) {
      if (
        state.insideHelper ||
        (helperFunctionPath && path.findParent((p) => p === helperFunctionPath))
      ) {
        return;
      }

      const { operator } = path.node;

      if (!OPERATOR_SYMBOLS[operator as keyof typeof OPERATOR_SYMBOLS]) {
        return;
      }

      if (!state.helperNeeded) {
        state.helperNeeded = true;
        state.helperName = generateHelperName(path.scope.getProgramParent());
      }

      const helperName = state.helperName!;

      const transformed = transformBinaryExpression(path.node, helperName);

      path.replaceWith(transformed);
      path.skip();
    },
  });

  const output = generate(ast, {
    retainLines: false,
    compact: false,
    sourceMaps: true,
  });

  return output;
}
