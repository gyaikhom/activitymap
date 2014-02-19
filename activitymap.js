(function() {
    // data = [
    //     {
    //         "y": 2014,
    //         "m": 10,
    //         "d": 14,
    //         "p": 10
    //     }, ...
    // ]
    ActivityMap = function(data, config) {
        this.data = data;
        this.id = config.id;
        this.parent = config.parent;
        this.init();
    };

    ActivityMap.prototype = {
        init: function() {
            var me = this, parent;
            me.process();
            if (typeof me.parent === "string")
                parent = d3.select(me.parent);
            me.node = parent.append('div')
                .attr('id', me.id)
                .attr('class', 'activity-map');
            me.parent = parent;
            me.months = {
                "0": {
                    "n": 31,
                    "s": "Jan",
                    "l": "January"
                },
                "1": {
                    "n": 28,
                    "s": "Feb",
                    "l": "February"
                },
                "2": {
                    "n": 31,
                    "s": "Mar",
                    "l": "March"
                },
                "3": {
                    "n": 30,
                    "s": "Apr",
                    "l": "April"
                },
                "4": {
                    "n": 31,
                    "s": "May",
                    "l": "May"
                },
                "5": {
                    "n": 30,
                    "s": "Jun",
                    "l": "June"
                },
                "6": {
                    "n": 31,
                    "s": "Jul",
                    "l": "July"
                },
                "7": {
                    "n": 31,
                    "s": "Aug",
                    "l": "August"
                },
                "8": {
                    "n": 30,
                    "s": "Sept",
                    "l": "September"
                },
                "9": {
                    "n": 31,
                    "s": "Oct",
                    "l": "October"
                },
                "10": {
                    "n": 30,
                    "s": "Nov",
                    "l": "November"
                },
                "11": {
                    "n": 31,
                    "s": "Dec",
                    "l": "December"
                }
            };
            me.weeks = "SMTWTFS";
        },
        process: function() {
            var me = this, processed = {}, data = me.data,
            record, y, m, d, i, c,
            minY = 0, maxY = 0, years = [], temp = {};

            for (i = 0, c = data.length; i < c; ++i) {
                record = data[i];
                if (record) {
                    y = record.y;
                    m = record.m;
                    d = record.d;
                    if (processed[y] === undefined)
                        processed[y] = {};
                    if (processed[y][m] === undefined)
                        processed[y][m] = {};
                    if (processed[y][m][d] === undefined)
                        processed[y][m][d] = record.v;
                    if (minY > y)
                        minY = y;
                    if (maxY < y)
                        maxY = y;
                    if (temp[y] === undefined) {
                        temp[y] = y;
                        years.push(y);
                    }
                }
            }
            me.processed = {
                'm': minY,
                'M': maxY,
                'y': years,
                'p': processed
            };
            console.log(me.processed);
        },
        renderMonth: function(y, m) {
            var me = this, i, c, d, n, w, month = me.months[m];
            d = new Date(y, m, 1);
            n = me.node.append('div').attr('class', 'month');
            n.append('div').attr('class', 'month-name').text(month.l);
            for (i = 0, c = d.getDay(); i < c; ++i)
                n.append('div').attr('class', 'empty-day');
            for (c = month.n + c; i < c; ++i) {
                w = n.append('div').attr('class', 'week-day');
                if (i % 7 === 0)
                    w.classed('week-start', true);
            }
            while (i++ % 7)
                n.append('div').attr('class', 'empty-day');
            n = n.append('div').attr('class', 'week-names');
            for (i = 0; i < 7; ++i)
                n.append('div').attr('class', 'week-name').text(me.weeks[i]);
        },
        renderYear: function(y) {
            var me = this, d, i;
            me.months[1].n = y % 4 ? 28 : 29;
            for (i = 0; i < 12; ++i)
                me.renderMonth(y, i);
        },
        render: function() {
            var me = this;
            me.renderYear(2014);
        }
    };
})();