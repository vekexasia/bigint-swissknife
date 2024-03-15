if (IS_BROWSER) {
  var _converter = await import('./browser.js')
} else {
  _converter = await import('./native.js')
}
export const converter = _converter.converter
