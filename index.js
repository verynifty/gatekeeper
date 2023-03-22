const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

// const web3 = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

const web3 = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");

GK_ADDRESS = "0x065886F25c2c6273A0365d0cBE43A17E75b6C9C9";
GK_ABI = require('./GATEKEEPER_ABI.json');

const GK = new ethers.Contract(GK_ADDRESS, GK_ABI, web3);

const gk_iface = new ethers.utils.Interface(GK_ABI);

const bot = new Telegraf("6153080757:AAH-FYsprOXth86Is4I-pbB1Gi7o4eLIEDY");
console.log(bot.telegram)
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

async function getAddressOfUser(userId) {
    let address = await GK.addressOfUsers(userId);
    return address;
}

async function isUserRegister(userId) {
    return getAddressOfUser(userId) != "0x0000000000000000000000000000000000000000"
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

async function onFlushRoom(ctx) {

    let chatId = ctx.message.chat.id;

    let members = await ctx.getChat(chatId);
    console.log(members)
}

async function setAddressRights(roomId, chatId, address, revoke_messages = false, notify = false) {
    let tgId = await GK.idOfUsers(address);
    if (parseInt(tgId) != 0) {
        let userBalance = await GK.balanceOf(from, roomId);
        if (parseInt(senderBalance.toString()) == 0) {
            bot.telegram.sendMessage(chatId.toString(), `🔨 ${from} is now banned`);
            bot.telegram.banChatMember(chatId, tgId, {
                chat_id: chatId,
                revoke_messages: true
            })
        } else {
            bot.telegram.unbanChatMember(chatId, tgId, {
                chat_id: chatId,
                revoke_messages: true
            })
        }
    } else {
        console.log("User not registered.")
    }
}

GK.on("TransferSingle", async (operator, from, to, id, amount) => {
    console.log("NEW TRANSFER")
    console.log(operator, from, to, id.toString(), amount.toString());
    let chatId = await GK.roomIds(id);
    await bot.telegram.sendMessage(chatId.toString(), `✉️ ${amount.toString()} pass was transferred from ${from} to ${to}.`);
    setAddressRights(id, chatId, from, false, true)
    setAddressRights(id, chatId, to, false, true)
})

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

bot.start(async (ctx) => {
    console.log("HELLO")
    const fromId = ctx.update.message.from.id;
    let address = await getAddressOfUser(fromId)
    if (address == "0x0000000000000000000000000000000000000000") {
        let data = gk_iface.encodeFunctionData("register", [fromId])
        ctx.sendMessage(`
Welcome to GateKeeper
To link your address to your Telegram account, visit this link and send the transaction with the address you want to use:

https://goerli.ethcmd.com/int3nt?to=${GK_ADDRESS}&data=${data}
`)
    } else {
        ctx.sendMessage(`
        You are registered with the address: ${address}.
        `)
    }
    console.log(ctx)
})

bot.on('message', async (ctx) => {
    const chatId = ctx.update.message.chat.id;
    const botId = ctx.botInfo.id;
    if (ctx.update.message.chat.type == "group") {
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
        } else if (ctx.update.message.chat.type == "group" && ctx.update.message.text == '/flush') {
            await onFlushRoom(ctx);
        }
    }
})

bot.startPolling()

/*
while (true) {
    let groups = getGroups();
}
*/