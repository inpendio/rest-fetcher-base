import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies);

export default {
  input: './index.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [['@babel/env', { modules: false }]],
      plugins: [
        'transform-class-properties',
        // 'transform-object-rest-spread',
        '@babel/plugin-transform-destructuring',
        '@babel/plugin-transform-spread',
        'syntax-object-rest-spread',
        '@babel/plugin-transform-arrow-functions',
      ],
      comments: true,
    }),
    nodeResolve({
      jsnext: true,
    }),
  ],
  external,
  output: [
    {
      file: pkg.rolledup,
      format: 'umd',
      sourcemap: true,
      strict: false,
      exports: 'named',
      name: 'reduxrestfetcher',
    },
    /* {
      file: pkg["jsnext:main"],
      format: "es",
      sourcemap: true,
      strict: false
    } */
  ],
};


/*
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};


// const external = Object.keys(pkg.dependencies);

export default {
  input: './index.js',
  plugins: [
    resolve({
    //   mainFields: ['jsnext:main'],
    }),
    babel({
      babelrc: false,
      presets: ['@babel/preset-env'],
      plugins: [
        'transform-class-properties',
        ['@babel/transform-runtime', {
          useESModules: true,
          // helpers: true,
          // regenerator: true,
        }],
        // 'babel-plugin-transform-async-to-promises',
        // 'babel-plugin-syntax-async-functions',
        // '@babel/plugin-transform-async-to-generator',
        '@babel/plugin-transform-destructuring',
        '@babel/plugin-transform-spread',
        'syntax-object-rest-spread',
        '@babel/plugin-transform-arrow-functions',

      ],
      comments: true,
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }), commonjs({
      // include: 'node_modules/**',
    }),
    // nodeResolve({
    //   jsnext: true,
    // }),
  ],
  external: makeExternalPredicate(external),
  output: [
    {
      file: pkg.rolledup,
      format: 'umd',
      sourcemap: true,
      strict: false,
      exports: 'named',
      name: 'reduxrestfetcher',
    },
    // {
    //   file: pkg["jsnext:main"],
    //   format: "es",
    //   sourcemap: true,
    //   strict: false
    // }
  ],
};

*/
