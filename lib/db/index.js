var db = {};
var async = require('async');
var path = require('path');
var __logger = require(path.join(path.dirname(__dirname),'logger'));

db.mysql = require(path.join(__dirname, 'mysql'));

db.initialize = function (_cb) {
    async.series(
        [
            db.mysql.connect,
        ],
        function (err, results) {
            if (err) {
                __logger.error('failed to run all databases', {err: err});
                _cb(err);
            } else {
                _cb(null);
            }
        }
    );
};

module.exports = db;