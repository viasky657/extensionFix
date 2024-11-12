import plugin from 'tailwindcss/plugin.js';
import tailwindcssForms from '@tailwindcss/forms';

export default {
    content: ['./src/webviews/**/*.tsx'],
    theme: {
        extend: {
            maxWidth: {
                'prose-lg': '75ch',
                'prose-xl': '90ch'
            },
            borderColor: {
                currentColor: 'currentColor'
            },
            fill: {
                currentColor: 'currentColor'
            },
            screens: {
                touch: {raw: '(pointer: coarse)'}
            }
        }
    },
    plugins: [
        plugin(tailwindcssForms),
    ]
};