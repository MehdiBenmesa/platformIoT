const databaseManager = require('./database-manager.js');

const dataMonitor = {};

dataMonitor.log = (object) => {
    return databaseManager.saveLog(object)
};

dataMonitor.getServiceLog = (service, device) => {
    return databaseManager.getLogs(service, device);
};

dataMonitor.getCompositeServiceLog = (service) => {
    return databaseManager.getLogs(service);
};

module.exports = dataMonitor;