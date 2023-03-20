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

    // check if it's a new member. If yes we check if he is allowed to be in the group or not
    if (true) {
        // check if we control this group
        console.log(userId, "joined the chat", chatId)
        // web3 call here
        // ban if not whitelisted
        if (false) {
            console.log("We ban him", userId, chatId)
            ctx.banChatMember(userId, 0, {
                chat_id: chatId,
                revoke_messages: true
            })
        }
    }
    console.log(ctx)
})

bot.startPolling()

/*
while (true) {
    let groups = getGroups();
}
*/