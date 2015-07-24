/* Copyright 2014 Gagarine Yaikhom (The MIT License) */
(function() {
    ActivityMap = function(data, config) {
        /* Contains an array of data points in the following format:
           [
           {
           "t": 1393009249000, // timestamp in milliseconds, or JS Date() object
           "v": 3,             // value
           } ...
           ]
        */
        this.data = data;
        this.id = 'example-activity-map';
        this.parent = 'body';
        this.hue = 85;
        this.title = 'Activity map: ';
        this.timeColumn = 't';
        this.valueColumn = 'v';
        this.fit = false;

        if (config) {
            if (config.id !== undefined)
                this.id = config.id;
            if (config.parent !== undefined)
                this.parent = config.parent;
            if (config.colours !== undefined)
                this.colours = config.colours;
            if (config.title !== undefined)
                this.title = config.title;
            if (config.timeColumn !== undefined)
                this.timeColumn = config.timeColumn;
            if (config.valueColumn !== undefined)
                this.valueColumn = config.valueColumn;
            if (config.fit !== undefined)
                this.fit = config.fit;
            if (config.hue !== undefined) {
                if (isNaN(config.hue))
                    throw 'Invalid Hue specification: should be an integer';
                else if (config.hue < 0 || config.hue > 360)
                    throw 'Invalid Hue specification: should be >= 0 and <= 360';
                else
                    this.hue = config.hue;
            }
        }
        this.luminosityScale = d3.scale.linear();
        this.init();
    };

    ActivityMap.prototype = {
        init: function() {
            var me = this, parent;
            me.process();
            if (typeof me.parent === 'string')
                parent = d3.select(me.parent);
            me.node = parent.append('div')
                .attr('id', me.id)
                .attr('class', 'activity-map');
            me.parent = parent;
            me.months = {
                '0': {
                    'n': 31,
                    'l': 'January'
                },
                '1': {
                    'n': 28,
                    'l': 'February'
                },
                '2': {
                    'n': 31,
                    'l': 'March'
                },
                '3': {
                    'n': 30,
                    'l': 'April'
                },
                '4': {
                    'n': 31,
                    'l': 'May'
                },
                '5': {
                    'n': 30,
                    'l': 'June'
                },
                '6': {
                    'n': 31,
                    'l': 'July'
                },
                '7': {
                    'n': 31,
                    'l': 'August'
                },
                '8': {
                    'n': 30,
                    'l': 'September'
                },
                '9': {
                    'n': 31,
                    'l': 'October'
                },
                '10': {
                    'n': 30,
                    'l': 'November'
                },
                '11': {
                    'n': 31,
                    'l': 'December'
                }
            };
            me.weeks = 'SMTWTFS';
        },
        reorderColours: function() {
            var me = this, c = me.colours, t, i = 0, j = c.length - 1;
            while (i < j) {
                t = c[i];
                c[i++] = c[j];
                c[j--] = t;
            }
        },
        process: function() {
            var me = this, data = me.data, record, ltab = { },
                y, m, d, i, c, t, v, years = [ ], temp = { },
                minY = Number.MAX_VALUE, maxY = 0,
                minV = Number.MAX_VALUE, maxV = 0,
                tc = me.timeColumn, vc = me.valueColumn;

            /* Create a three-dimensional lookup table from the array
               of activity data points */
            for (i = 0, c = data.length; i < c; ++i) {
                record = data[i];
                if (record) {
                    t = record[tc];
                    if (!(t instanceof Date))
                        t = new Date(parseInt(t));
                    y = t.getFullYear();
                    m = t.getMonth();
                    d = t.getDate() - 1;
                    v = parseFloat(record[vc]);

                    if (ltab[y] === undefined)
                        ltab[y] = { };
                    if (ltab[y][m] === undefined)
                        ltab[y][m] = { };
                    if (ltab[y][m][d] === undefined)
                        ltab[y][m][d] = v;

                    /* Get minimum and maximum years that defines the
                       activity data range */
                    if (minY > y)
                        minY = y;
                    if (maxY < y)
                        maxY = y;

                    if (minV > v)
                        minV = v;
                    if (maxV < v)
                        maxV = v;

                    /* Make an array of the years in range */
                    if (temp[y] === undefined) {
                        temp[y] = y;
                        years.push(y);
                    }
                }
            }
            me.luminosityScale.domain([0, maxV]);
            me.luminosityScale.range([100, 0]);
            me.processed = {
                'm': minY,
                'M': maxY,
                'v': minV,
                'V': maxV,
                'y': years,
                'l': ltab
            };
        },
        renderMonth: function(node, y, m, d) {
            var me = this, i, j, n, w, v, month = me.months[m],
                ltab = me.processed.l, colours = me.colours,
                percent;

            n = node.append('div')
                .attr('class', 'amap-month');
            n.append('div')
                .attr('class', 'amap-month-name')
                .text(month.l);

            /* Fill this with empty cells, so that the valid days are
               aligned correctly to the week-days */
            for (i = 0; i < d; ++i)
                n.append('div')
                .attr('class', 'amap-empty-day');

            /* Now add cells for the valid days */
            for (j = 0, d = month.n; j < d; ++i, ++j) {
                w = n.append('div')
                    .attr('class', 'amap-week-day');

                if (i % 7 === 0)
                    w.classed('amap-week-start', true);

                /* We set here the correct colour code using our
                   lookup table of values supplied by the user */
                try {
                    v = ltab[y][m][j];
                    if (v) {
                        percent = me.luminosityScale(v) + '%';
                        w.classed('has-value', true)
                            .attr('title', y + '-' + (m + 1)
                                  + '-' + (j + 1) + ': ' + v)
                            .style('background-color',
                                   d3.hsl('hsl('
                                          + me.hue + ','
                                          + 100 + '%,'
                                          + percent + ')')
                                  );
                    }
                } catch (e) {
                }
            }

            /* weekday for next month */
            d = i % 7;

            /* Fill remaining invalid days with empty cells */
            while (i++ % 7)
                n.append('div')
                .attr('class', 'amap-empty-day');

            /* Fill in week-day initials */
            n = n.append('div')
                .attr('class', 'amap-week-names');
            for (i = 0; i < 7; ++i)
                n.append('div')
                .attr('class', 'amap-week-name')
                .text(me.weeks[i]);

            return d;
        },
        renderYear: function(y) {
            var me = this, d, i, n;

            /* Account for leap-year */
            me.months[1].n = y % 4 ? 28 : 29;

            n = me.blocks.append('div')
                .attr('class', 'amap-year-block')
                .attr('year', y);
            n.append('div')
                .attr('class', 'amap-year-name')
                .text(y);
            n = n.append('div')
                .attr('class', 'amap-months');

            /* Find at what week day the first month of year begins */
            d = new Date(y, 0, 1);
            d = d.getDay();
            for (i = 0; i < 12; ++i)
                d = me.renderMonth(n, y, i, d);
        },
        isVisible: function(block, parent) {
            var yearDim = block.getBoundingClientRect(),
                parentDim = parent.getBoundingClientRect();
            return !(yearDim.top > parentDim.bottom ||
                     yearDim.bottom < parentDim.top);
        },
        onScroll: function(me) {
            var minYear = Number.MAX_VALUE, maxYear = 0, year;
            me.blocks.selectAll('.amap-year-block')
                .each(function() {
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
            var me = this, i, c, years = me.processed.y;
            me.year = me.node.append('div')
                .attr('class', 'amap-title');
            me.blocks = me.node.append('div')
                .attr('class', 'amap-year-blocks');
            me.blocks.on('scroll', function() {
                me.onScroll(me);
            });
            for (i = 0, c = years.length; i < c; ++i)
                me.renderYear(years[i]);
            me.onScroll(me);
            me.refit();
        },
        refit: function() {
            var me = this;
            if (!me.fit)
                me.blocks.style('height',
                            (parseInt(me.node.style('height'))
                             - parseInt(me.year.style('height'))) + 'px');
        }
    };
})();
