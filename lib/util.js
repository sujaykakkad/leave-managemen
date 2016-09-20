var async = require("async");

var holidays = ["2016-09-10", "2016-09-28", "2016-10-02"]

var check_valid_date = function(date){
        var day = date.getDay();
        var datestring = date.toISOString().slice(0, 10);
        return (day > 0 && day < 6 && holidays.indexOf(datestring) == -1);
}

module.exports = {
    validate_leave: function(start_date, end_date, leaves_remaining, _cb){
        var start = new Date(start_date);
        var end = new Date(end_date);
        var leaves = 0;
        while(start.toISOString().slice(0, 10) <= end.toISOString().slice(0, 10)){
            if(check_valid_date(start))
                leaves++;
            start.setDate(start.getDate() + 1);
        }
        if(leaves > leaves_remaining)
            return _cb(true);
        else
            return _cb(null, leaves)
    }
};