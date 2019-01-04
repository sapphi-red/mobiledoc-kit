import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';
import path from 'path';
import multiEntry from 'rollup-plugin-multi-entry';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import babel from 'rollup-plugin-babel';

const replaceVersion = replace({
  include: 'src/js/version.js',
  delimiters: ['##', '##'],
  values: {
    VERSION: pkg.version
  }
});

const CWD = process.cwd();

function fixMobiledocImport() {
  return {
    name: 'fix-mobiledoc-import',
    resolveId(importee, importer) {
      if (importee === 'mobiledoc-kit') {
        return `${CWD}/src/js/index.js`;
      }
      if (importee.startsWith('mobiledoc-kit/')) {
        // console.log(importee, '<-', importer);
        importee = importee.replace('mobiledoc-kit/', '');
        importee = `${CWD}/src/js/${importee}.js`;
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

  // CSS
  {
    input: 'src/css/mobiledoc-kit.css',
    output: {
      format: 'amd',
      file: 'dist/css/mobiledoc-kit.css'
    },
    plugins: [
      postcss({ extract: true }),

      // Put sourcemap in the correct place (Where Ember CLI expects and where
      // the previous Broccoli build put it).
      // Needs to run after the AMD build above is complete.
      // Should be able to define output.sourcemapFile instead but that is broken.
      // copy({ 'dist/amd/mobiledoc-kit.js.map': 'dist/amd/mobiledoc-kit.map', verbose: true })
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
      resolve(), // so Rollup can find `ms`
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: { "ie": "11" }}]
        ]
      })
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
