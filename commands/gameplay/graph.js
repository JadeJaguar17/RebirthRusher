const UserDB = require("../../database/controllers/userController");
const Canvas = require('chartjs-node-canvas');
const { RBR, DEV } = require("../../config/embedColors.json");
const { DEV_ID } = require("../../config/discordIds.json");

module.exports.name = "graph"
module.exports.description = "Graphs rebirth and prestige count"
module.exports.syntax = "`/graph`"
module.exports.aliases = ["g"]
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const identifier = (interaction.data.options?.[0]?.value) || interaction.member.user.id;

    // try to find the corresponding Discord User
    let discordUser = undefined;
    try {
        discordUser = await bot.users.get(identifier)
            || bot.users.find(u => identifier === u.username)
            || bot.users.find(u => identifier === `${u.username}#${u.discriminator}`)
            || bot.users.find(u => identifier === u.username)
            || await bot.getRESTUser(identifier);

        // if (discordUser && !bot.users.find(u => discordUser.id === u.id)) {
        //     bot.users.add(discordUser);
        // }
    } catch (error) { }

    // validate graph data
    const user = discordUser && await UserDB.getUserById(discordUser.id);
    if (!user) {
        return "Graph was not found for this user";
    } else if (
        user.settings.isPrivate
        && user._id !== interaction.member.user.id
        && interaction.member.user.id !== DEV_ID
    ) {
        return "User has set their graph to private";
    }

    // calculate some data to build the graph
    const tag = discordUser.username
    const maxTick = Math.ceil(Math.max(
        Math.max(...user.graph.tracker.rebirths),
        Math.max(...user.graph.tracker.rbDay)) / 5
    ) * 5;
    const theme = themes[user.settings.theme];
    const hasData = user.graph.tracker.rebirths.some(e => e > 0)
        || user.graph.tracker.prestiges.some(e => e > 0)
        || user.graph.tracker.rbDay.some(e => e > 0);

    const dateLabels = [];
    for (let i = 0; i < user.graph.tracker.dates.length; i++) {
        const date = user.graph.tracker.dates[i].split("/");
        const dateString = user.settings.dateFormat === "mm/dd"
            ? `${date[0]}/${date[1]}`
            : `${date[1]}/${date[0]}`;

        dateLabels.push(dateString);
    }

    // enable/disable Monday line plugin
    const drawVerticalLinePlugin = {
        id: 'drawVerticalLine',
        beforeDatasetsDraw: (chart) => {
            const { ctx, chartArea, scales } = chart;
            const xScale = scales['x-axis-0'];

            const labels = chart.data.labels;
            const dataPoints = labels.map((label, index) => {
                const [month, day] = label.split('/').map(Number);
                const currentYear = new Date().getFullYear();
                let date = new Date(currentYear, month - 1, day);

                // set year to last year if date is more than 30 days in the future
                const today = new Date();
                if (date - today > 30 * 24 * 60 * 60 * 1000) {
                    date = new Date(currentYear - 1, month - 1, day);
                }

                return { dayOfWeek: date.getDay(), index };
            });

            const sundayIndexes = dataPoints.filter((d) => d.dayOfWeek === 0).map((d) => d.index);
            const mondayIndexes = dataPoints.filter((d) => d.dayOfWeek === 1).map((d) => d.index);

            ctx.save();
            ctx.strokeStyle = user.settings.mondayLineColor;
            ctx.lineWidth = 4;

            sundayIndexes.forEach((sundayIndex) => {
                const mondayIndex = mondayIndexes.find((i) => i > sundayIndex);

                if (mondayIndex !== undefined) {
                    const sundayX = xScale.getPixelForValue(labels[sundayIndex]);
                    const mondayX = xScale.getPixelForValue(labels[mondayIndex]);
                    const xPosition = (sundayX + mondayX) / 2;
                    const { top, bottom } = chartArea;

                    // draw vertical line between Sunday and Monday
                    ctx.beginPath();
                    ctx.moveTo(xPosition, top);
                    ctx.lineTo(xPosition, bottom);
                    ctx.stroke();
                    ctx.closePath();
                }
            });

            ctx.restore();
        }
    };
    plugins = user.settings.mondayLine
        ? [drawVerticalLinePlugin]
        : []

    // generate the graph
    const graph = theme.canvas.renderToBufferSync({
        type: "bar",
        data: {
            labels: dateLabels,
            datasets: [{
                type: "line",
                label: "Rb/day",
                data: user.graph.tracker.rbDay,
                borderColor: user.settings.rbDayColor || defaults.rbday,
                fill: false,
                borderWidth: 2,
                lineTension: 0,
                pointBackgroundColor: user.settings.rbDayColor || defaults.rbday,
                spanGaps: true,
                pointRadius: 5
            },
            {
                label: "Prestiges",
                data: user.graph.tracker.prestiges,
                backgroundColor: user.settings.prColor || defaults.pr,
                barPercentage: 0.85
            },
            {
                label: "Rebirths",
                data: user.graph.tracker.rebirths,
                backgroundColor: user.settings.rbColor || defaults.rb,
                barPercentage: 0.85
            }]
        },
        options: {
            pointRadius: 0,
            fill: false,
            title: {
                display: true,
                text: tag,
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
                        display: hasData,
                        beginAtZero: true,
                        stepSize: 5,
                        min: 0,
                        max: maxTick,
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
                        display: hasData,
                        beginAtZero: true,
                        stepSize: 5,
                        min: 0,
                        max: maxTick,
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
                        display: false
                    }
                }],
            }
        },
        plugins: plugins
    });

    // send personal bests only if the graph belongs to the user
    const personalBests = `**Highest stats for one day**\n`
        + `- Rebirths: ${user.graph.personalBests.rb}\n`
        + `- Prestiges: ${user.graph.personalBests.pr}\n`
        + `- Rb/day: ${user.graph.personalBests.rbDay}`;

    return {
        content: interaction.member.user.id == user._id ? personalBests : "",
        file: {
            file: graph,
            name: "graph.png"
        }
    };
}

module.exports.options = [
    {
        name: "user",
        description: "user to check graph (via mention or ID)",
        type: 6,
    },
    {
        name: "username",
        description: "user to check graph (via username)",
        type: 3
    }
]

// bring out the Canvas's since they take a lot of memory to generate
// 0 = dark, 1 = light
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

const defaults = {
    "rb": RBR,
    "pr": DEV,
    "rbday": "#E74C3C"
};
