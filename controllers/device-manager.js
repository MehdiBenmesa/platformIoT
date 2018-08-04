const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');
const deviceRegistry = require('../models/device-registery.js');

const deviceManager = {};

deviceManager.start = () => {
    client.on('connect', () => {
        client.subscribe('device');
        client.subscribe('device/exit');
    });

    client.on('message', deviceManager.handle);
    return deviceRegistry.init()
        .then( (devices) => {
            for(let device of devices){
                deviceManager.checkAlive(device);
            }
            return true;
        });
};

deviceManager.handle = (topic, message) => {
    message = JSON.parse(message);
    if (topic === 'device') {
       deviceManager.register(message);
    }else if(topic === 'device/exit'){
        deviceManager.setDeviceDown(message.name);
    }
};

deviceManager.checkAlive = (device) => {
    client.publish(`device/${device.name}`, JSON.stringify({'check': true}));
};

deviceManager.setDeviceDown = (name) => {
    deviceRegistry.setDown(name);
};

deviceManager.register = (device) => {
    deviceRegistry.add(device);
};

deviceManager.getCurrentDevices = () => {
    return deviceRegistry.getDevices();
};

deviceManager.removeDevice = (name) => {
    return deviceRegistry.remove(name);
};

module.exports = deviceManager;

