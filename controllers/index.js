var path = require("path");
var users = require(path.join(path.dirname(__dirname), "models", "users"));
var __logger = require(path.join(path.dirname(__dirname), "lib", "logger"));
var async = require("async");
var util = require(path.join(path.dirname(__dirname), "lib", "util"));

module.exports = function (router) {
    
	router.get("/", function(req, res){
		if (req.session.auth && req.session.user) {
            res.redirect("/home");
        }else {
            res.render("login.ejs");
        }
	});

	router.post("/login", function (req, res) {
        if (req.session.auth && req.session.user) {
            res.redirect("/home");
        }
        else {
            users.auth_user(req.body.username, req.body.password, function (err, user) {
                if (err){
                    __logger.error(err);
                     res.render("partials/global");
                }else if (user == null) {
                    res.render("login", {"error": err});
                }else {
                    req.session.auth = true;
                    req.session.user = user;
                    res.redirect("/home");
                }
            });
        }
    });

    router.get("/get_requests", function (req, res) {
        if (req.session.auth && req.session.user) {
            var user = req.session.user;
            if(user.usr_type == "employee")
                users.view_employee_requests(user.usr_id, function(err, result){
                    if (err){
                        __logger.error(err);
                        res.render("partials/global");
                    }
                    else{
                        res.send({data: result});
                    }
                });
            else
                users.view_manager_requests(user.usr_id, function(err, result){
                    if (err){
                        __logger.error(err);
                        res.render("partials/global");
                    }
                    else{
                        res.send({data: result});
                    }
                });
        }else {
            res.redirect("/");
        }
    });

    router.post("/request_leave", function (req, res) {
        if (req.session.auth && req.session.user && req.session.user.usr_type == "employee") {
            
            util.validate_leave(req.body.start_date, req.body.end_date, req.session.user.leaves_remaining, function(err, duration){
                if(err){
                    __logger.error(err);
                    res.render("partials/global");
                }
                else{
                    user = req.session.user;
                    users.add_leave_request(user.usr_id, user.mgr_id, req.body.start_date, req.body.end_date, duration, function(err, result){
                        if(err){
                            __logger.error(err);
                            res.render("partials/global");
                        }
                        else
                            res.render("partials/global_success");
                    });
                }
            })
        }else {
            res.redirect("/");
        }
    });

    router.get("/home", function (req, res) {
        if (req.session.auth && req.session.user) {
            if (req.session.user.usr_type == "manager")
                res.render("manager_home", {user: req.session.user});
            else 
                res.render("employee_home", {user: req.session.user});
        }
        else {
            res.render("login.ejs");
        }
    });

    router.post("/leave_approval", function (req, res){
        if (req.session.auth && req.session.user && req.session.user.usr_type == "manager") {
           
            if(req.body["data[approval_status]"] != "Pending"){

                    res.send({data:{error: true, msg: "Only Pending Requests can be approved or disapproved"}});

            }else if(req.body.status == "approve"){
                async.parallel([
                    function (callback){
                        users.check_for_repeated_dates(req.body["data[usr_id]"], req.body["data[start_date]"], req.body["data[end_date]"], function (err, result){
                            if(err){
                                __logger.error(err);
                                return callback("Internal Server Error")
                            }else if(result == true){
                                return callback("The Dates where already selected")
                            }else{
                                return callback(null);
                            }
                        });
                    },

                    function (callback){
                        users.get_user(req.body["data[usr_id]"], function (err, result){
                            if(err){
                                __logger.error(err);
                                return callback("Internal Server Error")

                            }else if(result == null){
                                return callback("User not found")

                            }else if(req.body["data[duration]"] > result.duration){
                                return callback("Cannot approve leaves more than the remaining leaves");

                            }else{
                                return callback(null)
                            }
                        });
                    }],
                    
                    function (err, results){
                        if(err)
                            res.send({data:{error: true, msg: err}})
                        else{
                            users.approve_leave(req.body["data[req_id]"], req.body["data[duration]"], req.body["data[usr_id]"], function (err, result){
                                if(err){
                                    __logger.error(err);
                                    res.send({data:{error: true, msg: "Internal Server Error"}})
                                }
                                else
                                    res.send({data:{error: false, msg: "Leave Approved"}})
                            });
                        }
                });
            }else{
                users.disapprove_leave(req.body["data[req_id]"], function (err, result){
                    if(err){
                        __logger.error(err);
                        res.send({data:{error: true, msg: "Internal Server Error"}})
                    }
                    else
                        res.send({data:{error: false, msg: "Leave Disapproved"}})
                });
            }
            
        }
        else
            res.redirect("/");
    });

    router.get("/logout", function (req, res) {
        if (req.session.auth && req.session.user) {
            req.session.destroy();
        }
        res.redirect("/");
    });
}