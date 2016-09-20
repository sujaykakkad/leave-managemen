var path = require("path");
var crypto = require("crypto");
var mysql = require(path.join(path.dirname(__dirname),"lib","db","mysql"));
var util = require(path.join(path.dirname(__dirname), "lib", "util"));
var __logger = require(path.join(path.dirname(__dirname), "lib", "logger"));
var async = require("async");

module.exports = {
    
    auth_user: function (usr_id, password, _cb) {
        mysql.getConn().query({sql:"SELECT usr_id, usr_type, mgr_id, leaves_remaining FROM user WHERE usr_id = ? and usr_password = ?"}, [usr_id, password], function (err, result, fields) {
            if (err)
                return _cb(err);
            else {
                if (result == "")
                    return _cb(null, null);
                return _cb(null, result[0]);
            }
        });
    },

    get_user: function(usr_id, _cb){
        mysql.getConn().query({sql:"SELECT usr_id, usr_type, mgr_id, leaves_remaining FROM user WHERE usr_id = ?"}, [usr_id], function (err, result, fields) {
            if (err)
                return _cb(err);
            else {
                if (result == "")
                    return _cb(null, null);
                return _cb(null, result[0]);
            }
        });
    },

    add_leave_request: function(usr_id, mgr_id, start_date, end_date, duration, _cb){     
        mysql.getConn().query({sql: "INSERT INTO leave_request (usr_id, mgr_id, approval_status, duration, start_date, end_date) values(?, ?, ?, ?, ?, ?)"}, 
            [usr_id, mgr_id, "Pending", duration, start_date, end_date], function(err, result, fields) {
                if (err)
                    return _cb(err);
                else {
                    if (result == "")
                        return _cb(null, false);
                    else
                        return _cb(null,result);
                }
        });  
    },

    view_employee_requests: function (usr_id, _cb) {
        mysql.getConn().query({sql: "SELECT * FROM leave_request WHERE usr_id = ?"}, 
            [usr_id], function(err, result, fields) {
                if (err)
                    return _cb(err);
                else {
                    return _cb(null,result)
                }
        });     
    },

    view_manager_requests: function (mgr_id, _cb) {
        mysql.getConn().query({sql: "SELECT * FROM leave_request WHERE mgr_id = ? AND approval_status =?"}, 
            [mgr_id, "Pending"], function(err, result, fields) {
                if (err)
                    return _cb(err);
                else {
                    return _cb(null,result)
                }
        });     
    },

    check_for_repeated_dates: function(usr_id, start_date, end_date, _cb){
        mysql.getConn().query({sql: "SELECT start_date, end_date FROM leave_request WHERE usr_id = ? AND approval_status != ? AND (? BETWEEN start_date AND end_date OR ? BETWEEN start_date AND end_date);"}, 
            [usr_id, "Pending", start_date, end_date], function(err, result, fields) {
                if (err){
                    return _cb(err);
                }else if (result == ""){
                    return _cb(null,false);
                }else{
                    return _cb(null, true);
                }
        });
    },

    approve_leave: function(req_id, duration, usr_id, _cb){
        async.parallel([
            function (callback){
                mysql.getConn().query({sql: "UPDATE leave_request SET approval_status = ? WHERE req_id= ?;"}, 
                    ["Approved", req_id], function(err, result, fields) {
                        if (err){
                            return callback(err);
                        }else{
                            return callback(null);
                        }
                });
            },
            function (callback){
                mysql.getConn().query({sql: "UPDATE user SET leaves_remaining = leaves_remaining - ? WHERE usr_id = ?"}, 
                    [duration, usr_id], function(err, result, fields) {
                        if (err){
                            return callback(err);
                        }else{
                            return callback(null);
                        }
                });
            }],
            function (err){
                if(err)
                    return _cb(err);
                else
                    return _cb(null);
            }
        );
    },

    disapprove_leave: function(req_id, _cb){
        mysql.getConn().query({sql: "UPDATE leave_request SET approval_status = ? WHERE req_id= ?;"}, 
            ["Disapproved", req_id], function(err, result, fields) {
                if (err){
                    return _cb(err);
                }else{
                    return _cb(null, true);
                }
        });
    }

};