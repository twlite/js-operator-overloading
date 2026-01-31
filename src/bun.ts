import {
  transform as transformCore,
  type TransformOptions,
} from './transform.js';

export function transform(options: TransformOptions = {}): Bun.BunPlugin {
  return {
    name: 'js-operator-overloading',
    setup(build) {
      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const source = await Bun.file(args.path).text();
        const result = transformCore(source, {
          sourceType: 'module',
          typescript: args.path.endsWith('.ts') || args.path.endsWith('.tsx'),
          jsx: args.path.endsWith('.jsx') || args.path.endsWith('.tsx'),
          ...options,
        });

        return {
          contents: result.code,
          loader: args.path.endsWith('.ts')
            ? 'ts'
            : args.path.endsWith('.tsx')
            ? 'tsx'
            : args.path.endsWith('.js')
            ? 'js'
            : 'jsx',
        };
      });
    },
  };
}
