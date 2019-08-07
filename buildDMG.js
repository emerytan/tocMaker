var createDMG = require('electron-installer-dmg')

var opts = {
    "appPath": './build/S19 TOC Maker-darwin-x64/S19 TOC Maker.app',
    "name": "S19 TOC Maker",
    "title": "S19 TOC Maker",
    "overwrite": true,
    "out": "./dist"
}

createDMG(opts, function done(err) {
    if (err) {
        console.error(err)
    } else {
        console.log('finsihed creating DMG without fucking up.');
        
    }
})
