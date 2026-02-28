const path = require('node:path')
const pkg = require('../..')

if (typeof pkg.ComposableSearch !== 'function') {
  throw new TypeError('ComposableSearch export를 찾을 수 없습니다.')
}

const cssExportPath = require.resolve('../../dist/style.css')
if (!cssExportPath.endsWith(path.join('dist', 'style.css'))) {
  throw new Error(`style.css export 경로가 올바르지 않습니다: ${cssExportPath}`)
}

module.exports = pkg
