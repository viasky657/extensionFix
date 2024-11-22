import plugin from 'tailwindcss/plugin.js';
import tailwindcssForms from '@tailwindcss/forms';

export default {
  content: ['./src/webviews/**/*.tsx'],
  theme: {
    extend: {
      borderRadius: {
        xs: '0.1875rem',
      },
      maxWidth: {
        'prose-lg': '75ch',
        'prose-xl': '90ch',
      },
      colors: {
        'focus-border': 'var(--vscode-focusBorder)',
        foreground: 'var(--vscode-foreground)',
        'error-foreground': 'var(--vscode-errorForeground)',
        current: 'currentColor',
        'disabled-foreground': 'var(--vscode-disabledForeground)',
        success: 'var(--vscode-terminal-ansiBrightGreen)',
        accent: 'var(--vscode-terminal-ansiBrightBlue)',
        widget: {
          border: 'var(--vscode-widget-border)',
        },
        selection: 'var(--vscode-selection-background)',
        error: 'var(--vscode-error-foreground)',
        link: {
          foreground: 'var(--vscode-textLink-foreground)',
          'active-foreground': 'var(--vscode-textLink-activeForeground)',
        },
        description: 'var(--vscode-descriptionForeground)',
        button: {
          primary: {
            background: 'var(--vscode-button-background)',
            foreground: 'var(--vscode-button-foreground)',
            'hover-background': 'var(--vscode-button-hoverBackground)',
            border: 'var(--vscode-button-border)',
          },
          secondary: {
            background: 'var(--vscode-button-secondaryBackground)',
            foreground: 'var(--vscode-button-secondaryForeground)',
            'hover-background': 'var(--vscode-button-secondaryHoverBackground)',
          },
        },
        checkbox: {
          foreground: 'var(--vscode-checkbox-foreground)',
          background: 'var(--vscode-checkbox-background)',
          'selection-background': 'var(--vscode-checkbox-selectBackground)',
          border: 'var(--vscode-checkbox-border)',
          'selection-border': 'var(--vscode-checkbox-selectBorder)',
        },
        radio: {
          'active-foreground': 'var(--vscode-radio-activeForeground)',
          'active-background': 'var(--vscode-radio-activeBackground)',
          'active-border': 'var(--vscode-radio-activeBorder)',
          'inactive-foreground': 'var(--vscode-radio-inactiveForeground)',
          'inactive-background': 'var(--vscode-radio-inactiveBackground)',
          'inactive-border': 'var(--vscode-radio-inactiveBorder)',
          'inactive-hover-background': 'var(--vscode-radio-inactiveHoverBackground)',
        },
        dropdown: {
          foreground: 'var(--vscode-dropdown-foreground)',
          background: 'var(--vscode-dropdown-background)',
          border: 'var(--vscode-dropdown-border)',
        },
        input: {
          foreground: 'var(--vscode-input-foreground)',
          background: 'var(--vscode-input-background)',
          border: 'var(--vscode-input-border)',
          'placeholder-foreground': 'var(--vscode-input-placeholderForeground)',
          'invalid-foreground': 'var(--vscode-inputValidation-errorForeground)',
          'invalid-border': 'var(--vscode-inputValidation-errorBorder)',
          'invalid-background': 'var(--vscode-inputValidation-errorBackground)',
        },
        badge: {
          foreground: 'var(--vscode-badge-foreground)',
          background: 'var(--vscode-badge-background)',
        },
        terminal: {
          foreground: 'var(--vscode-terminal-foreground)',
          background: 'var(--vscode-terminal-background)',
          border: 'var(--vscode-terminal-border)',
          'selection-background': 'var(--vscode-terminal-selectionBackground)',
          'selection-foreground': 'var(--vscode-terminal-selectionForeground)',
        },
        panel: {
          background: 'var(--vscode-panel-background)',
          border: 'var(--vscode-panel-border)',
        },
        list: {
          'selection-background': 'var(--vscode-list-activeSelectionBackground)',
          'selection-foreground': 'var(--vscode-list-activeSelectionForeground)',
        },
        'progress-bar': {
          background: 'var(--vscode-progressBar-background)',
        },
        sidebar: {
          background: 'var(--vscode-sideBar-background)',
          foreground: 'var(--vscode-sideBar-foreground)',
          border: 'var(--vscode-sideBar-border)',
          'drop-background': 'var(--vscode-sideBar-dropBackground)',
          title: {
            foreground: 'var(--vscode-sideBarTitle-foreground)',
            background: 'var(--vscode-sideBarTitle-background)',
          },
          'section-header': {
            background: 'var(--vscode-sideBarSectionHeader-background)',
            foreground: 'var(--vscode-sideBarSectionHeader-foreground)',
            border: 'var(--vscode-sideBarSectionHeader-border)',
          },
          'activity-bar-top': {
            border: 'var(--vscode-sideBarActivityBarTop-border)',
          },
          'sticky-scroll': {
            background: 'var(--vscode-sideBarStickyScroll-background)',
            border: 'var(--vscode-sideBarStickyScroll-border)',
            shadow: 'var(--vscode-sideBarStickyScroll-shadow)',
          },
        },
        'activity-bar': {
          background: 'var(--vscode-activityBar-background)',
          foreground: 'var(--vscode-activityBar-foreground)',
          border: 'var(--vscode-activityBar-border)',
          'active-background': 'var(--vscode-activityBar-activeBackground)',
          'active-border': 'var(--vscode-activityBar-activeBorder)',
          'active-foreground': 'var(--vscode-activityBar-activeForeground)',
          'inactive-foreground': 'var(--vscode-activityBar-inactiveForeground)',
        },
      },
      animation: {
        'translate-lr': 'translate-lr 3s linear infinite',
      },
      keyframes: {
        'translate-lr': {
          '0%': { transform: 'translateX(-100%);' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      screens: {
        touch: { raw: '(pointer: coarse)' },
      },
    },
  },
  plugins: [plugin(tailwindcssForms)],
};
