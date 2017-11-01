/**
 * Created by yangl on 2017/8/18.
 */
Ext.define("MyApp.view.chart.SystemCpuUsage", {
    extend: "Ext.panel.Panel",
    html: "<div id=\"main\" style=\"height:400px\"></div>",
    initComponent: function () {
        var me = this;
        var myChart;
        var time = [];
        var data = [];
        var drawChart = function () {
            setInterval(function () {
                var ds = new Date().toLocaleTimeString().replace(/^\D*/, '')
                if (time.length > 3600) {
                    time.shift();
                    data.shift();
                }
                time.push(ds);
                data.push(parseInt(Math.random()*100));
                console.log(data)
                if(data.length == 5) {
                myChart.setOption({
                    title: {
                        text: 'CPU系统监控'
                    },
                    tooltip: {},
                    legend: {
                        data: ['cpu1']
                    },
                    xAxis: {
                        data: time
                    },
                    yAxis: {},
                    series: [{
                        name: 'cpu1', // 根据名字对应到相应的系列
                        type: 'line',
                        data: data
                    }]
                });
                }
            }, 1000)
        }
        me.on("render", function () {
            require(['echarts', 'echarts/chart/bar',
                'echarts/chart/line'], function (ec) {
                myChart = ec.init(document
                    .getElementById('main'));
                option = {
                    title: {
                        text: '动态数据 + 时间坐标轴'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (params) {
                            params = params[0];
                            var date = new Date(params.name);
                            return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
                        },
                        axisPointer: {
                            animation: false
                        }
                    },
                    xAxis: {
                        type: 'time',
                        splitLine: {
                            show: false
                        }
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '100%'],
                        splitLine: {
                            show: false
                        }
                    },
                    series: [{
                        name: '模拟数据',
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        data: data
                    }]
                };
            });

            var ws = new WebSocket("ws://127.0.0.1:9090/ws");
            ws.onopen = function () {
                ws.send("{topic : 'REG',endPoint : {userId:'admin'}}");
                ws.send("{topic : 'SUBSCRIBE',value : 'JVM_STAT_M'}");
            };
            ws.onmessage = function (evt) {
                console.log(evt.data);
                // ws.close();
            };
            ws.onclose = function (evt) {
                console.log("WebSocketClosed!");
            };
            ws.onerror = function (evt) {
                console.log("WebSocketError!");
            };
        });
        me.callParent();
    }
});