module.exports = {
  plugins: ['eslint-plugin-tsdoc'],
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  },
  "ignorePatterns": ["**/dist/**/*"],
  "extends": "standard-with-typescript",
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"

  },
  rules: {
    'tsdoc/syntax': 'warn'
  }
}
