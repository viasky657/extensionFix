import plugin from "tailwindcss/plugin.js";
import tailwindcssForms from "@tailwindcss/forms";
import { addVSCodeThemeColors } from "./src/tailwind/vscode-theme-colors";
import vscodeColorIds from "./src/tailwind/vscode-used-theme-color-ids.json";

export default {
  content: ["./src/webviews/**/*.tsx"],
  theme: {
    extend: {
      maxWidth: {
        "prose-lg": "75ch",
        "prose-xl": "90ch",
      },
      colors: addVSCodeThemeColors(vscodeColorIds),
      borderColor: {
        currentColor: "currentColor",
      },
      fill: {
        currentColor: "currentColor",
      },
      screens: {
        touch: { raw: "(pointer: coarse)" },
      },
    },
  },
  plugins: [plugin(tailwindcssForms)],
};
