// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

const buildDir = path.join(__dirname, '..', 'dist')
function createEsmModulePackageJson () {
  fs.readdir(buildDir, function (err, dirs) {
    if (err) {
      throw err
    }
    dirs.forEach(function (dir) {
      if (dir === 'esm') {
        const packageJsonFile = path.join(buildDir, dir, '/package.json')
        if (!fs.existsSync(packageJsonFile)) {
          fs.writeFile(
            packageJsonFile,
            new Uint8Array(Buffer.from('{"type": "module"}')),
            function (err) {
              if (err) {
                throw err
              }
            }
          )
        }
      }
    })
  })
}

createEsmModulePackageJson()
