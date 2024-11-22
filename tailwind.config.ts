import { nextui } from '@nextui-org/react'
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
     "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      fontFamily: {
        nunito: ['"Nunito"', "sans-serif"],
        montserrat: ['"Montserrat"', "sans-serif"],
        poppins: ['"Poppins"', "sans-serif"],
        sen: ['"Sen"', "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()]
} satisfies Config