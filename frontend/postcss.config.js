// postcss.config.js
module.exports = {
  plugins: [
    require("tailwindcss"), // Add Tailwind CSS as a PostCSS plugin
    require("autoprefixer"), // Add Autoprefixer for automatic vendor prefixing
  ],
};
