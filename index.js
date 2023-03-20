const { Telegraf } = require('telegraf')

const bot = new Telegraf("6153080757:AAH-FYsprOXth86Is4I-pbB1Gi7o4eLIEDY");

function getGroups() {
    return ([
        {
        id: "chatId"
        }
    ])
}

bot.on('message', async (ctx) => {
    // check if it's a new member. If yes we check if he is allowed to be in the group
    if (true) {

    }
    console.log(ctx)
})

bot.startPolling()

/*
while (true) {
    let groups = getGroups();
}
*/