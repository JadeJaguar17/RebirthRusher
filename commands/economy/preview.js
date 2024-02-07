const users = require("../../models/userModel");
const shop = require("../../config/shop.json");
const Canvas = require('chartjs-node-canvas');

const themes = [
    {
        background: "#36393F",
        labels: "#FFFFFF",
        gridLines: "#72767D",
        canvas: new Canvas.ChartJSNodeCanvas({
            width: 800, height: 600, chartCallback: (ChartJS) => {
                ChartJS.plugins.register({
                    beforeDraw: (chartInstance) => {
                        chartInstance.chart.ctx.fillStyle = "#36393F";
                        chartInstance.chart.ctx.fillRect(
                            0, 0,
                            chartInstance.chart.width,
                            chartInstance.chart.height
                        );
                    },
                })
            }
        })
    },
    {
        background: "#FFFFFF",
        labels: "#060607",
        gridLines: "#81868F",
        canvas: new Canvas.ChartJSNodeCanvas({
            width: 800, height: 600, chartCallback: (ChartJS) => {
                ChartJS.plugins.register({
                    beforeDraw: (chartInstance) => {
                        chartInstance.chart.ctx.fillStyle = "#FFFFFF";
                        chartInstance.chart.ctx.fillRect(
                            0, 0,
                            chartInstance.chart.width,
                            chartInstance.chart.height
                        );
                    },
                })
            }
        })
    }
];

module.exports = {
    name: "preview",
    description: "Previews a graph color",
    syntax: "`/preview [graph color] [category]`",
    needsAccount: true,
    execute: async function (interaction) {
        const category = interaction.data.options[0].value;
        const colorID = interaction.data.options[1].value;
        const hex = (interaction.data.options[2] && interaction.data.options[2].value) || null;

        if (colorID === 14) {
            if (!hex) {
                return ":no_entry_sign: To preview a custom hex, please include"
                    + " the hex (3rd option)`";
            } else if (!isHex(hex)) {
                return ":no_entry_sign: Invalid hex!";
            }
        }

        if (colorID === 15) {
            return ":no_entry_sign: You can't preview themes, only graph colors";
        }

        const item = colorID === 14 ? { hex: hex } : shop.find(i => colorID === i.id);

        if (!item) {
            return ":no_entry_sign: Color ID can't be previewed";
        }

        const user = await users.findById(interaction.member.user.id);
        const theme = themes[user.settings.theme];
        const graph = theme.canvas.renderToBufferSync({
            type: "bar",
            data: {
                labels: ["1/1", "1/2", "1/3", "1/4", "1/5", "1/6", "1/7"],
                datasets: [{
                    type: "line",
                    label: "Rb/day",
                    data: [6, 6, 7, 7, 6, 6, 7, 6],
                    borderColor: (category == "rbday" && item.hex)
                        || user.settings.rbDayColor
                        || "#E67E22",
                    fill: false,
                    borderWidth: 2,
                    lineTension: 0,
                    pointBackgroundColor: (category == "rbday" && item.hex)
                        || user.settings.rbDayColor
                        || "#E67E22",
                    spanGaps: true,
                    pointRadius: 5
                },
                {
                    label: "Prestiges",
                    data: [0, 1, 0, 0, 0, 1, 0],
                    backgroundColor: (category == "pr" && item.hex)
                        || user.settings.prColor
                        || "#A84300",
                    barPercentage: 0.85
                },
                {
                    label: "Rebirths",
                    data: [7, 9, 8, 7, 8, 7, 6],
                    backgroundColor: (category == "rb" && item.hex)
                        || user.settings.rbColor
                        || "#E74C3C",
                    barPercentage: 0.85
                }]
            },
            options: {
                pointRadius: 0,
                fill: false,
                title: {
                    display: true,
                    text: "Graph Preview",
                    fontSize: 32,
                    fontColor: theme.labels
                },
                legend: {
                    labels: {
                        fontColor: theme.labels,
                        fontSize: 15
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 5,
                            min: 0,
                            max: 10,
                            fontColor: theme.labels
                        },
                        gridLines: {
                            color: theme.gridLines,
                            zeroLineColor: theme.gridLines
                        },
                        stacked: false,
                        position: "left"
                    },
                    {
                        ticks: {
                            beginAtZero: true,
                            stepSize: 5,
                            min: 0,
                            max: 10,
                            fontColor: theme.labels
                        },
                        gridLines: {
                            color: theme.gridLines,
                            zeroLineColor: theme.gridLines
                        },
                        stacked: false,
                        position: "right"
                    }],
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            fontColor: theme.labels
                        },
                        gridLines: {
                            color: theme.background,
                            zeroLineColor: theme.gridLines
                        }
                    }],
                }
            },
        });

        return {
            name: "*Note: stats shown are made-up, not your actual stats*",
            file: { file: graph, name: "preview.png" }
        };
    },
    options: [
        {
            name: "category",
            description: "category of graph to preview color for",
            type: 3,
            required: true,
            choices: [
                {
                    name: "rebirth",
                    value: "rb"
                },
                {
                    name: "prestige",
                    value: "pr"
                },
                {
                    name: "rb/day",
                    value: "rbday"
                }
            ]
        },
        {
            name: "id",
            description: "ID of color to preview (put 14 for custom hex)",
            type: 4,
            required: true
        },
        {
            name: "hex",
            description: "custom hex",
            type: 3
        }
    ]
}

function isHex(hex) {
    return /^#?([0-9A-F]{3}){1,2}$/i.test(hex);
}
