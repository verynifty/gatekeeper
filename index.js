const { Telegraf } = require('telegraf')

const bot = new Telegraf("6153080757:AAH-FYsprOXth86Is4I-pbB1Gi7o4eLIEDY");

function getGroups() {
    return ([
        {
            id: "chatId"
        }
    ])
}

async function getRoom(chatId) {
    return null;
}

function isTgAdmin(userInfo) {
    return (userInfo.status === 'creator' || userInfo.status === 'administrator');
}

async function onGateKeep(ctx) {
    console.log(ctx)
    const chatId = ctx.update.message.chat.id;
    const botId = ctx.botInfo.id;
    const senderId = ctx.update.message.from.id;
    console.log(chatId, botId)
    let room = await getRoom(chatId);
    if (room != null) {

    } else {
        let senderInfo = await ctx.getChatMember(senderId)
        if (!isTgAdmin(senderInfo)) {
            ctx.sendMessage(`
                You need to be an admin to do this.
            `);
            return;
        }
        let botInfo = await ctx.getChatMember(botId)
        if (!isTgAdmin(botInfo)) {
            ctx.sendMessage(`
            I need to be an admin in this group to work.
        `)
        }
    }
}

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
console.log(bot)

bot.command('/gatekeep', async (ctx) => {

})

bot.on('message', async (ctx) => {
    const chatId = ctx.update.message.chat.id;
    const botId = ctx.botInfo.id;
    // check if it's a new member. If yes we check if he is allowed to be in the group or not
    if (ctx.update.message.new_chat_member != null && ctx.update.message.chat.type == "group") {
        const userId = ctx.update.message.new_chat_member.id;
        // check if we control this group
        console.log(userId, "joined the chat", chatId)
        // web3 call here
        // ban if not whitelisted
        if (false) {
            console.log("Bann user", userId, chatId)
            ctx.banChatMember(userId, 0, {
                chat_id: chatId,
                revoke_messages: true
            })
        }
    }

    if (ctx.update.message.chat.type == "group" && ctx.update.message.text == '/gatekeep') {
        await onGateKeep(ctx);
    }
})

bot.startPolling()

/*
while (true) {
    let groups = getGroups();
}
*/