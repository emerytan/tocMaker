const {
	dialog
} = require('electron').remote
const {
	spawn,
	exec
} = require('child_process')
const ipc = require('electron').ipcRenderer
const path = require('path')
const fs = require('fs')
const {
	StringDecoder
} = require('string_decoder')
const decoder = new StringDecoder('utf8')

var cmdOut
var countRegex = /(^count:)\s(\d{1,})/
var userOptions = {

}

window.onload = function () {
	ipc.send('init')
}


var bashOutput1 = document.getElementById('bashOutput1')
var debugMessages = document.getElementById('debugMessages')
var barcode = document.getElementById('barcode')

document.ondragover = document.ondrop = (event) => {
	event.preventDefault()
}

document.body.ondrop = (event) => {
	userOptions.basePath = event.dataTransfer.files[0].path
	event.preventDefault()
	getTapeName(userOptions.basePath)
	document.getElementById('basePath').innerText = userOptions.basePath
}



ipc.on('app path', (event, message) => {
	userOptions.thisPath = message.toString()
	document.getElementById('debugMessages').innerText = 'App initialized'
	document.getElementById('setBasePath').disabled = false
	document.getElementById('getDestination').disabled = true
	document.getElementById('runScript').disabled = true
})

document.getElementById('setBasePath').addEventListener('click', (element, event) => {
	document.getElementById('bashOutput1').innerText = ''
	dialog.showOpenDialog({
		buttonLabel: 'Get LTFS Tape',
		properties: ['openDirectory']
	}, (selection) => {
		if (selection) {
			userOptions.basePath = selection[0]
			document.getElementById('basePath').innerText = userOptions.basePath
			getTapeName(userOptions.basePath)
		} else {
			alert('You must drop a tape to enable other functions')
		}
	})
}, false)


document.getElementById('getDestination').addEventListener('click', (element, event) => {
	dialog.showOpenDialog({
		// defaultPath: userOptions.basePath,
		buttonLabel: 'Set Destination Path',
		properties: ['openDirectory', 'createDirectory']
	}, (selection) => {
		userOptions.destPath = selection[0]
		document.getElementById('destPath').innerText = userOptions.destPath
		if (userOptions.basePath && userOptions.destPath) {
			document.getElementById('runScript').disabled = false
		}
	})
}, false)


document.getElementById('runScript').addEventListener('click', (element, event) => {

	var myButtons = document.getElementsByTagName('button')

	for (let index = 0; index < myButtons.length; index++) {
		myButtons[index].disabled = true
	}

	let scriptPath = path.join(userOptions.thisPath, 'scripts/bin/makeTOC.sh')
	const runEDL = spawn(scriptPath, [
		userOptions.basePath,
		userOptions.destPath,
		userOptions.tapeName
	])

	runEDL.on('error', (error) => {
		bashOutput1.innerText = decoder.write(error)
	})

	runEDL.stdout.on('data', (data) => {
		let pin = document.getElementById('bashOutput1')
		cmdOut = decoder.write(data)
		
		if (countRegex.test(cmdOut)) {
			let count = countRegex.exec(cmdOut)
			debugMessages.innerText = count
		}

		pin.innerText += cmdOut
		pin.scrollTop = pin.scrollHeight
	})

	runEDL.stderr.on('data', (data) => {
		let pin = document.getElementById('bashOutput1')
		pin.innerText += decoder.write(data)
		pin.scrollTop = pin.scrollHeight
	})

	runEDL.on('exit', (code) => {
		if (code.toString() == '0') {
			let pin = document.getElementById('bashOutput1')
			pin.innerText += decoder.write(`done...`)
			pin.scrollTop = pin.scrollHeight

			let tocPath = path.join(userOptions.destPath, `${userOptions.tapeName}.txt`)
			exec(`wc -l < ${tocPath} | xargs`, (error,stdout,stderr) => {
				if (!error || !stderr) {
					document.getElementById('fileCount').innerText = stdout
				}
			})

			for (let index = 0; index < myButtons.length; index++) {
				myButtons[index].disabled = false
			}

		} else {
			debugMessages.style.color = 'red'
			debugMessages.innerText = 'FUCK... Something went wrong'
		}

	})
}, false)

function getTapeName(basePath) {

	bashOutput1.innerText = ''
	let scriptPath = path.join(userOptions.thisPath, 'scripts/bin/barcodeName.sh')
	var getBarcode = spawn(scriptPath, [basePath])

	getBarcode.on('error', (err) => {
		bashOutput1.innerText = `getBarcode error: ${err.toString()}`
	})

	getBarcode.stderr.on('data', (data) => {
		bashOutput1.innerText = `get barcode stderr: ${data.toString()}`
	})

	getBarcode.stdout.on('data', (data) => {
		userOptions.tapeName = data.toString()
	})

	getBarcode.on('exit', (code) => {
		if (code == '0') {
			barcode.innerText = userOptions.tapeName
			document.getElementById('getDestination').disabled = false
		} else {
			bashOutput1.innerText = 'error on getTapeName'
		}
	})

}


