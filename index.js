const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

// const web3 = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

const web3 = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");

GK_ADDRESS = "0x065886F25c2c6273A0365d0cBE43A17E75b6C9C9";
GK_ABI = require('./GATEKEEPER_ABI.json');

const gk_iface = new ethers.utils.Interface(GK_ABI);

const bot = new Telegraf("6153080757:AAH-FYsprOXth86Is4I-pbB1Gi7o4eLIEDY");
bot.use(session());

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

function isUserRegister(userId) {

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
            return;
        }
        ctx.scene.enter("createRoom")

    }
}

const createRoom = new Scenes.BaseScene("createRoom");
createRoom.enter(ctx => ctx.reply(`Looks like we are ready to gatekeep this channel 🫡

You'll need to make a transaction in order to register this group. How many pass do you want to mint? (Don't worry you can mint more later).
`));
createRoom.on(message("text"), async ctx => {
    // validate
    let supply = ctx.message.text;
    let chatId = ctx.message.chat.id;
    if (parseInt(supply) > 0) {
        let data = gk_iface.encodeFunctionData("createRoom", [chatId, supply])
        await ctx.reply(`
        Ok, follow the following link and execute the transaction to register this channel with a starting supply of ${supply}.
        
https://goerli.ethcmd.com/int3nt?to=${GK_ADDRESS}&data=${data}`);
    } else {
        await ctx.reply(`
        this doesn't look like a valid number. Start again the process.`);
    }
    return ctx.scene.leave();
});

const stage = new Scenes.Stage([createRoom]);
bot.use(stage.middleware());

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