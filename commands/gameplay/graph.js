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

    const dateLabels = [];
    for (let i = 0; i < user.graph.tracker.dates.length; i++) {
        const date = user.graph.tracker.dates[i].split("/");
        const dateString = user.settings.dateformat === "mm/dd"
            ? `${date[0]}/${date[1]}`
            : `${date[1]}/${date[0]}`;

        dateLabels.push(dateString);
    }

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
                        color: theme.background,
                        zeroLineColor: theme.gridLines
                    }
                }],
            }
        },
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
        name: "tag",
        description: "user to check graph (via tag)",
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
