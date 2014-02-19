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
        this.colours = config.colours;
        this.title = config.title;
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
        reorderColours: function() {    
            var me = this, t, i = 0, j = me.colours.length - 1;
            while (i < j) {
                t = me.colours[i];
                me.colours[i++] = me.colours[j];
                me.colours[j--] = t;
            }
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
                        processed[y][m][d] = record.p;
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
        },
        renderMonth: function(node, y, m) {
            var me = this, i, c, d, n, w, v, month = me.months[m];
            d = new Date(y, m, 1);
            n = node.append('div').attr('class', 'month');
            n.append('div').attr('class', 'month-name').text(month.l);
            for (i = 0, c = d.getDay(); i < c; ++i)
                n.append('div').attr('class', 'empty-day');
            for (c = month.n + c; i < c; ++i) {
                w = n.append('div').attr('class', 'week-day');
                if (i % 7 === 0)
                    w.classed('week-start', true);
                try {
                    v = me.processed.p[y][m][i];
                    if (v !== undefined)
                        w.style('background-color', me.colours[Math.ceil(v * .25)]);
                } catch(e) {
                }
            }
            while (i++ % 7)
                n.append('div').attr('class', 'empty-day');
            n = n.append('div').attr('class', 'week-names');
            for (i = 0; i < 7; ++i)
                n.append('div').attr('class', 'week-name').text(me.weeks[i]);
        },
        renderYear: function(y) {
            var me = this, d, i, n;
            me.months[1].n = y % 4 ? 28 : 29;
            n = me.blocks.append('div').attr('class', 'year-block').attr('year', y);
            for (i = 0; i < 12; ++i)
                me.renderMonth(n, y, i);
        },
        isVisible: function(block, parent) {
            var yearDim = block.getBoundingClientRect(),
            parentDim = parent.getBoundingClientRect();
            return !(yearDim.top > parentDim.bottom ||
                     yearDim.bottom < parentDim.top);
        },
        onScroll: function(me) {
            var minYear = 99999, maxYear = 0, year;
            me.blocks.selectAll('.year-block').each(function() {
                if (me.isVisible(this, me.blocks.node())) {
                    year = parseInt(d3.select(this).attr('year'));
                    if (minYear > year)
                        minYear = year;
                    if (maxYear < year)
                        maxYear = year;
                }
            });
            if (minYear === maxYear)
                me.year.text(me.title + maxYear);
            else
                me.year.text(me.title + minYear + '-' + maxYear);
        },
        render: function() {
            var me = this, i, c, p = me.processed, y = p.y;
            me.year = me.node.append('div').attr('class', 'year-name');
            me.blocks = me.node.append('div').attr('class', 'year-blocks');
            me.blocks.on('scroll', function() {
                me.onScroll(me);
            });
            me.refit();
            for (i = 0, c = y.length; i < c; ++i)
                me.renderYear(y[i]);
            me.onScroll(me);
        },
        refit: function() {
            var me = this;
            me.blocks.style('height',
                            (parseInt(me.node.style('height'))
                             - parseInt(me.year.style('height'))) + 'px');
        }
    };
})();