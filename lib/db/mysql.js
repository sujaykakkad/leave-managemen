var mysql = require("mysql");
var path = require("path");
var __config = require(path.join(path.dirname(path.dirname(__dirname)), "config"));
var __logger = require(path.join(path.dirname(__dirname),'logger'));

var state = {
    db: null
};

module.exports = {

    connect: function (_cb) {
        if (state.db != null) 
            return _cb(null);

        var connection = mysql.createPool({
            connection_limit: __config.mysql.connection_limit,
            host : __config.mysql.host,
            user: __config.mysql.user,
            password: __config.mysql.password,
            port: __config.mysql.port,
            database: __config.mysql.database
        });

        connection.getConnection(function (err, db) {
            if (err) {
                __logger.error("Error while Connecting to Mysql", err);
                _cb(err, null);
            } else {
                if (err) 
                    return _cb(err);
                state.db = db;
                return _cb(null)
            }  
        });
    },

    getConn: function () {
        return state.db;
    }
};
