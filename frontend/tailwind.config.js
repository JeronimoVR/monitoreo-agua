/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aqua: {
          50: '#f0f9ff',
          500: '#00b4d8', // Secundario
          600: '#0077b6', // Primario
          900: '#023e8a',
        },
        emerald: {
          500: '#2dcf8e', // Éxito / Seguro
        }
      },
    },
  },
  plugins: [],
}