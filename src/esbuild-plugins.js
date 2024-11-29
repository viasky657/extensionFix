const fs = require('fs');
const path = require('path');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

/**
 * Creates a file copy plugin for esbuild
 * @param {Array<{from: string, to: string}>} files - Array of file paths to copy
 * @returns {import('esbuild').Plugin}
 */
function copyFilesPlugin(files) {
  return {
    name: 'copy-files',
    setup(build) {
      build.onEnd(async () => {
        const outdir = build.initialOptions.outdir;
        if (!outdir) {
          throw new Error('outdir is required for copy-files plugin');
        }

        for (const file of files) {
          try {
            // Ensure source file exists
            if (!fs.existsSync(file.from)) {
              console.warn(`Source file not found: ${file.from}`);
              continue;
            }

            // Create destination directory if it doesn't exist
            const destDir = path.dirname(path.join(outdir, file.to));
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }

            // Copy the file
            fs.copyFileSync(file.from, path.join(outdir, file.to));

            console.log(`Copied: ${file.from} -> ${path.join(outdir, file.to)}`);
          } catch (error) {
            console.error(`Error copying file ${file.from}:`, error);
          }
        }
      });
    },
  };
}

module.exports = {
  esbuildProblemMatcherPlugin,
  copyFilesPlugin,
};
