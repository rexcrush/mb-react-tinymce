const nodeModulePath = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { DefinePlugin, BannerPlugin, optimize: { UglifyJsPlugin, ModuleConcatenationPlugin } } = webpack

const { NODE_ENV = 'production' } = process.env
const IS_PRODUCTION = NODE_ENV === 'production'

// console.log({ NODE_ENV, IS_PRODUCTION })

const OPTIONS = {
  BABEL_LOADER: IS_PRODUCTION
    ? { presets: [ [ 'es2015', { modules: false } ], 'stage-0', 'react' ] }
    : { presets: [ 'stage-0', 'react' ] },
  CSS_LOADER: IS_PRODUCTION
    ? { importLoaders: 1, localIdentName: '[hash:base64:12]' }
    : { importLoaders: 1, localIdentName: '[name]_[local]_[hash:base64:5]' },
  POSTCSS_LOADER: { plugins: () => [ require('postcss-cssnext') ] }
}

module.exports = {
  resolve: {
    alias: { source: nodeModulePath.resolve(__dirname, '../source') }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader', options: OPTIONS.BABEL_LOADER }
        ]
      },
      {
        test: /\.pcss$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: OPTIONS.CSS_LOADER },
            { loader: 'postcss-loader', options: OPTIONS.POSTCSS_LOADER }
          ]
        })
      }
    ]
  },
  plugins: [].concat(
    new ExtractTextPlugin('index.css'),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !IS_PRODUCTION
    }),
    IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new UglifyJsPlugin({
        beautify: true,
        mangle: false,
        compress: {
          sequences: false, // join consecutive statements with the “comma operator”
          properties: true, // optimize property access: a["foo"] → a.foo
          dead_code: true, // discard unreachable code
          drop_debugger: false, // discard “debugger” statements
          unsafe: false, // some unsafe optimizations (see below)
          conditionals: true, // optimize if-s and conditional expressions
          comparisons: true, // optimize comparisons
          evaluate: true, // evaluate constant expressions
          booleans: true, // optimize boolean expressions
          loops: true, // optimize loops
          unused: true, // drop unused variables/functions
          hoist_funs: false, // hoist function declarations
          hoist_vars: false, // hoist variable declarations
          if_return: true, // optimize if-s followed by return/continue
          join_vars: false, // join var declarations
          cascade: false, // try to cascade `right` into `left` in sequences
          side_effects: true, // drop side-effect-free statements
          warnings: true, // warn about potentially dangerous optimizations/code
          global_defs: {} // global definitions
        }
      }),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
      new BannerPlugin({ banner: '/* stylelint-disable */', raw: true, test: /\.css$/, entryOnly: false })
    ] : []
  )
}