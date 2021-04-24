import { Bluetooth } from '@nativescript-community/ble'
import { Toasty, ToastDuration } from '@triniwiz/nativescript-toasty'
import {
    Observable,
    ObservableArray,
    Frame
} from '@nativescript/core'

export const bluetooth = new Bluetooth()
const devicesArray = new ObservableArray([])
const toastDisabled = new Toasty({ text: 'Bluetooth not enabled.' })
const toastDisconnected = new Toasty({ text: 'Device disconnected.' })
const toastScanning = new Toasty({ text: 'Scanning for devices...', duration: ToastDuration.LONG })

export function onPageLoaded (args) {
    const page = args.object
    const vm = new Observable()
    vm.devicesArray = devicesArray
    page.bindingContext = vm
}

export function onListViewLoaded (args) {
    const listView = args.object
    return listView
}

export function onRefresh () {
    const scanResult = []
    function _startScanning () {
        bluetooth.startScanning({
            seconds: 5,
            onDiscovered: rawDevice => {
                const device = {}; device.name = rawDevice.name; device.UUID = rawDevice.UUID
                if (scanResult.length === 0 || !scanResult.some(x => x.UUID === device.UUID)) {
                    scanResult.push(device)
                }
            }
        }).then(() => {
            for (let i = 0; i < scanResult.length; i++) {
                if (!devicesArray.some(x => x.UUID === scanResult[i].UUID)) {
                    devicesArray.push(scanResult[i])
                }
            }
        })
    }
    bluetooth.isBluetoothEnabled().then(enabled => {
        if (enabled === false) {
            toastDisabled.show()
            bluetooth.enable().then(enabled => {
                if (enabled === false) {
                    toastDisabled.show()
                } else {
                    toastScanning.show()
                    _startScanning()
                }
            })
        } else {
            toastScanning.show()
            _startScanning()
        }
    })
}

export function onItemTap (args) {
    const index = args.index
    bluetooth.connectedUUID = devicesArray.getItem(index).UUID
    bluetooth.connect({
        UUID: bluetooth.connectedUUID,
        onConnected: device => {
            const toastConnected = new Toasty({ text: `Connected to: ${device.name || device.UUID}` })
            toastConnected.show()
        },
        onDisconnected: () => toastDisconnected.show()
    }).then(() => {
        const frame = Frame.getFrameById('mainFrame')
        frame.navigate('control-page')
    }).catch(() => alert('Bluetooth not enabled, please enable it.'))
}
