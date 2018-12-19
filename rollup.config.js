import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import path from 'path';
import multiEntry from 'rollup-plugin-multi-entry';

function fixMobiledocImport() {
  return {
    name: 'fix-mobiledoc-import',
    resolveId(importee, importer) {
      if (importee === 'mobiledoc-kit') {
        return '/Users/coryforsyth/work/opensource/bustle/mobiledoc-kit/src/js/index.js';
      }
      if (importee.startsWith('mobiledoc-kit/')) {
        // console.log(importee, '<-', importer);
        importee = importee.replace('mobiledoc-kit/', '');
        importee =
          '/Users/coryforsyth/work/opensource/bustle/mobiledoc-kit/src/js/' +
          importee +
          '.js';
        // console.log('abs:', importee);
        let rel = path.relative(importer, importee);
        rel = path.resolve(importer, rel);
        // console.log('rel:', rel);
        return rel;
      } else {
        return null;
      }
    }
  };
}

export default [
  // browser-friendly UMD build
  {
    input: 'src/js/index.js',
    output: {
      name: 'Mobiledoc',
      file: 'dist/amd/mobiledoc-kit.amd.js',
      format: 'amd',
      amd: {
        id: 'mobiledoc-kit'
      },
      exports: 'named'
    },
    plugins: [
      fixMobiledocImport(),
      resolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ]
  },

  {
    input: 'src/js/index.js',
    output: {
      name: 'Mobiledoc',
      file: 'dist/global/mobiledoc-kit.js',
      format: 'iife',
      exports: 'named'
    },
    plugins: [
      fixMobiledocImport(),
      resolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ]
  },

  // TESTS
  {
    input: 'tests/**/*.js',
    output: {
      name: 'Mobiledoc',
      file: 'dist/rollup/tests/index.js',
      format: 'iife',
      exports: 'named',
      globals: {
        'mobiledoc-kit': 'Mobiledoc',
        'ember-cli/test-loader': 'TestLoader'
      }
    },
    plugins: [
      multiEntry(),
      fixMobiledocImport(),
      resolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ]
  }

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  // {
  //   input: 'src/js/index.js',
  //   external: ['mobiledoc-dom-renderer', 'mobiledoc-text-renderer'],
  //   output: [
  //     { file: pkg.main, format: 'cjs' },
  //     { file: pkg.module, format: 'es' }
  //   ]
  // }
];
