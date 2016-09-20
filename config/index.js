var path = require("path");
var app_name = "leave_management";
var all = {
    env: process.env.NODE_ENV,
    path: __dirname,
    app_name: app_name,
    port: 3000,

    session:{
        secret: "+*/leave|?&",
        resave: false,
        saveUninitialized: false,
        maxAge: Date.now() + (30 * 86400 * 1000),
        name: app_name + "_ssid"
    },

    logging: {
        log_file: path.join(path.dirname(__dirname), "logs","log"),
        console: true,
        json: false,
        level: 'silly', 
        datePattern: 'yyyy-MM-dd',
        maxsize: 104857600, 
        colorize: 'true',
    },

    mysql: {
        connection_limit: 10,
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'leave_management',
        port: 3306
    }
 }
module.exports = all;