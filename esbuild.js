const esbuild = require('esbuild');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const stylePlugin = require('esbuild-style-plugin');
const svgr = require('esbuild-plugin-svgr');
const { esbuildProblemMatcherPlugin, copyFilesPlugin } = require('./src/esbuild-plugins');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function extension() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    external: [
      'vscode',
      'lodash',
      'os',
      'path',
      'fs',
      'http',
      'net',
      'date-fns',
      '@radix-ui/*'
    ],
    outfile: 'dist/extension.js',
    // logLevel: 'silent',
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

async function webview() {
  const ctx = await esbuild.context({
    entryPoints: ['src/webviews/index.tsx', 'src/webviews/style.css'],
    bundle: true,
    format: 'esm',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'browser',
    outdir: 'dist',
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': production ? '"production"' : '"development"',
      'process.env.IS_PRODUCTION': production ? 'true' : 'false',
    },
    // logLevel: 'silent',
    plugins: [
      stylePlugin({
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      }),
      svgr(),
      copyFilesPlugin([{ from: './src/icon.png', to: 'icon.png' }]),
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
    loader: {
      '.svg': 'file',
      '.ttf': 'file',
    },
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

try {
  webview();
  extension();
} catch (error) {
  console.error(error);
  process.exit(1);
}
