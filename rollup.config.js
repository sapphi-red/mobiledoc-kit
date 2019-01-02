import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import path from 'path';
import multiEntry from 'rollup-plugin-multi-entry';
import replace from 'rollup-plugin-replace';

const replaceVersion = replace({
  include: 'src/js/version.js',
  delimiters: ['##', '##'],
  values: {
    VERSION: pkg.version
  }
});

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
      file: pkg.browser,
      format: 'amd',
      amd: {
        id: 'mobiledoc-kit'
      },
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      replaceVersion,
      fixMobiledocImport(),
      resolve() // so Rollup can find packages in node-modules
    ]
  },

  {
    input: 'src/js/index.js',
    output: {
      name: 'Mobiledoc',
      file: pkg.browserGlobal,
      format: 'iife',
      exports: 'named'
    },
    plugins: [
      replaceVersion,
      fixMobiledocImport(),
      resolve() // so Rollup can find `ms`
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
      replaceVersion,
      fixMobiledocImport(),
      resolve() // so Rollup can find `ms`
    ]
  },

  {
    input: 'src/js/index.js',
    // external: ['mobiledoc-dom-renderer', 'mobiledoc-text-renderer'],
    output: [
      {
        exports: 'named',
        file: pkg.main,
        format: 'cjs'
      },
      {
        exports: 'named',
        file: pkg.module,
        format: 'es'
      }
    ],
    plugins: [
      replaceVersion,
      fixMobiledocImport(),
      resolve() // so Rollup can find packages in node-modules
    ]
  }
];
