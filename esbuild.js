const esbuild = require("esbuild");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const stylePlugin = require("esbuild-style-plugin");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`
        );
      });
      console.log("[watch] build finished");
    });
  },
};

async function extension() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    external: ["vscode"],
    outfile: "dist/extension.js",
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
    entryPoints: ["src/webviews/index.tsx", "src/webviews/style.css"],
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "browser",
    outdir: "dist",
    jsx: "automatic",
    // logLevel: 'silent',
    plugins: [
      stylePlugin({
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      }),
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

try {
  webview();
  extension();
} catch (error) {
  console.error(error);
  process.exit(1);
}
