module.exports = {
  plugins: [
      `@babel/plugin-proposal-optional-chaining`,
      `@babel/plugin-syntax-dynamic-import`,
      ...(process.env.NODE_ENV === `production` ? [`transform-remove-console`] : [])
  ],
  presets: [
    `@vue/app`
  ],
};
