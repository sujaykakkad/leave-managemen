var path = require("path");
var __config = require(path.join(path.dirname(path.dirname(__dirname)), "config"));
var winston = require('winston');
var moment = require('moment');


var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: __config.logging.level,
            colorize: __config.logging.colorize,
            'timestamp': function () {
                return moment().format('YYYY-MM-DD HH:mm:ss');
            }
        }),
        new (winston.transports.DailyRotateFile)({
            json: false,
            filename: __config.logging.log_file,
            level: __config.logging.level,
            datePattern: (__config.logging.datePattern) ? '.' + __config.logging.datePattern : '.yyyy-MM-dd',
            maxsize: (__config.logging.maxsize) ? __config.logging.maxsize : 104857600, // 100 MB,
            'timestamp': function () {
                return moment().format('YYYY-MM-DD HH:mm:ss');
            }
        })
    ]
});

if (!__config.logging.console) {
    logger.remove(winston.transports.Console);
}

module.exports = logger;