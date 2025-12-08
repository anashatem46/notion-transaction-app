/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js,jsx}",
    "./public/src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B3C53',
          dark: '#0f2635',
          light: '#234C6A',
        },
        secondary: '#234C6A',
        accent: '#456882',
        'light-gray': '#E3E3E3',
      }
    }
  },
  plugins: [],
}

