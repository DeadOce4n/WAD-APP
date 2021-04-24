import { Frame } from '@nativescript/core'
import { bluetooth } from './main-page.js'

export function onTap (args) {
    const button = args.object
    console.log(`${button.id}`)
    if (button.id !== 'exit') {
        sendByte(button.id)
    } else {
        bluetooth.disconnect({
            UUID: bluetooth.connectedUUID
        }).then(() => {
            console.log('Disconnected successfully.')
        }, err => {
            console.log(`Disconnection error: ${err}`)
        })
        delete bluetooth.connectedUUID
        const frame = Frame.getFrameById('mainFrame')
        frame.navigate('main-page')
    }
}

export function onPageLoaded () {
    console.log('Navigated to control-page')
}

function sendByte (buttonId) {
    let byte
    switch (buttonId) {
    case 'kiss':
        byte = 'a'
        break
    case 'hug':
        byte = 'b'
        break
    case 'tickles':
        byte = 'c'
        break
    case 'pat':
        byte = 'd'
        break
    }
    bluetooth.write({
        peripheralUUID: bluetooth.connectedUUID,
        serviceUUID: 'ffe0',
        characteristicUUID: 'ffe1',
        value: byte,
        encoding: 'utf-8'
    }).then(() => {
        console.log(`Value written: ${byte}`)
    }, err => {
        console.log(`Write error: ${err}`)
    })
}
