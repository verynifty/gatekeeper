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
    console.log(ctx.update)
    // check if it's a new member. If yes we check if he is allowed to be in the group or not
    if (ctx.update.message.new_chat_member != null && ctx.update.message.chat.type == "group") {
        const userId = ctx.update.message.new_chat_member.id;
        const chatId = ctx.update.message.chat.id;
        // check if we control this group
        console.log(userId, "joined the chat", chatId)
        // web3 call here
        // ban if not whitelisted
        if (true) {
            console.log("We ban him", userId, chatId)
            ctx.banChatMember(userId, 0, {
                chat_id: chatId,
                revoke_messages: true
            })
        }
    }
})

bot.startPolling()

/*
while (true) {
    let groups = getGroups();
}
*/