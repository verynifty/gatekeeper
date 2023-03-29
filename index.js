const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

require("dotenv").config();


const web3 = new ethers.providers.JsonRpcProvider(process.env.RPC);
GK_ADDRESS = process.env.CONTRACT_ADDRESS;
GK_ABI = require('./GATEKEEPER_ABI.json');
const GK = new ethers.Contract(GK_ADDRESS, GK_ABI, web3);
const gk_iface = new ethers.utils.Interface(GK_ABI);

const bot = new Telegraf(process.env.TELEGRAM);
bot.use(session());

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

async function getRoom(chatId) {
    let room = await GK.IdsOfRooms(chatId);
    return parseInt(room.toString());
}

async function onGateKeep(ctx) {
    console.log(ctx)
    const chatId = ctx.update.message.chat.id;
    const botId = ctx.botInfo.id;
    const senderId = ctx.update.message.from.id;
    console.log(chatId, botId)
    let room = await getRoom(chatId);
    if (room != 0) {
        ctx.sendMessage(`
        This channel is already gated.
    `);
    return;
    } else {
        let senderInfo = await ctx.getChatMember(senderId)
        if (!isTgAdmin(senderInfo)) {
            ctx.sendMessage(`
                You need to be an admin to do this.
            `);
            return;
        }
        if (ctx.update.message.chat.type != "supergroup") {
            ctx.sendMessage(`
            You'll first need to set the group to public then change it back to private.
        `)
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
    if (parseInt(tgId.toString()) != 0) {
        let userBalance = await GK.balanceOf(address, roomId);
        console.log("blance: ", userBalance.toString());
        if (parseInt(userBalance.toString()) == 0) {
            try {

                await bot.telegram.sendMessage(chatId.toString(), `🔨 ${address} is now banned`);
                await bot.telegram.banChatMember(chatId.toString(), tgId.toString(), {
                    revoke_messages: revoke_messages
                })

            } catch (error) {
                console.log(error)
            }
        } else {
            console.log("unban")
            try {
                await bot.telegram.unbanChatMember(chatId.toString(), tgId.toString(), {
                    only_if_banned: true
                })
            } catch (error) {
                console.log(error)
            }

        }
    } else {
        console.log("User not registered.")
    }
}

GK.on("TransferSingle", async (operator, from, to, id, amount) => {
    console.log("NEW TRANSFER")
    console.log(operator, from, to, id.toString(), amount.toString());
    setTimeout(async () => {
        let chatId = await GK.roomIds(id);
        try {
            await bot.telegram.sendMessage(chatId.toString(), `✉️ ${amount.toString()} pass was transferred from ${from} to ${to}.`);
        } catch (error) {
            console.log(error)
        }
        setAddressRights(id, chatId.toString(), from, false, true)
        setAddressRights(id, chatId.toString(), to, false, true)
    }, 10000);
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
        
https://arbitrum.ethcmd.com/int3nt?to=${GK_ADDRESS}&data=${data}`);
    } else {
        await ctx.reply(`
        this doesn't look like a valid number. Start again the process.`);
    }
    return ctx.scene.leave();
});

const stage = new Scenes.Stage([createRoom]);
bot.use(stage.middleware());

bot.start(async (ctx) => {
    const fromId = ctx.update.message.from.id;
    let address = await getAddressOfUser(fromId)
    if (address == "0x0000000000000000000000000000000000000000") {
        let data = gk_iface.encodeFunctionData("register", [fromId])
        ctx.sendMessage(`
Welcome to GateKeeper
To link your address to your Telegram account, visit this link and send the transaction with the address you want to use:

https://arbitrum.ethcmd.com/int3nt?to=${GK_ADDRESS}&data=${data}

By registering, you'll receive an NFT that will allow you to access the main Gate channel.

Once your transaction is confirmed, execute again the start command to see the channels you have access to.
`)
    } else {
        let nbChannels = await GK.nbRooms();
        console.log(nbChannels.toString())
        let rooms = [];
        let addresses = [];
        for (let index = 1; index <= nbChannels; index++) {
            rooms.push(index);
            addresses.push(address);
        }
        let balances = await GK.balanceOfBatch(addresses, rooms);
        console.log(balances)
        let channels = 0;
        channelList = `
You have access to the following channels:
`
        for (let index = 0; index < nbChannels; index++) {
            if (parseInt(balances[index].toString()) > 0) {
                let chatId = await GK.roomIds(index + 1);
                channels++;
                console.log(chatId)
                let chatInfo = await bot.telegram.getChat(chatId.toString())
                let invite_link = chatInfo.invite_link;
               // if (invite_link == null) {
                    let chatInvite = await bot.telegram.createChatInviteLink(chatId.toString())
                    invite_link = chatInvite.invite_link;
                //}
                try {
                    channelList += (index + 1) + ". " + chatInfo.title + " - " + invite_link + "/n/n";
                } catch (error) {

                }


            }
        }
        ctx.sendMessage(`
        You are registered with the address: ${address}.

        ${channelList}

        You can also create your own channel by inviting the bot in a group you own and executing the /gatekeep command.
        `)
    }
})

bot.on('message', async (ctx) => {
    const chatId = ctx.update.message.chat.id;
    const botId = ctx.botInfo.id;
    if (ctx.update.message.chat.type == "group" || ctx.update.message.chat.type == "supergroup") {
        if (ctx.update.message.text == '/gatekeep') {
            await onGateKeep(ctx);
            return;
        }
        // check if it's a new member. If yes we check if he is allowed to be in the group or not
        let roomId = await GK.IdsOfRooms(chatId);
        if (parseInt(roomId.toString()) == 0) {
            console.log("Not a registered room.")
            return;
        }
        if (ctx.update.message.new_chat_member != null) {
            const userId = ctx.update.message.new_chat_member.id;
            // check if we control this group
            console.log(userId, "joined the chat", chatId)
            // web3 call here
            // ban if not whitelisted
            let shouldBan = true;
            let address = await getAddressOfUser(userId);
            if (address != "0x0000000000000000000000000000000000000000") {
                let userBalance = await GK.balanceOf(address, roomId.toString());
                if (parseInt(userBalance.toString()) > 0) {
                    shouldBan = false;
                }
            }
            if (shouldBan) {
                console.log("Bann user", userId, chatId)
                try {
                    await ctx.banChatMember(userId, 0, {
                        chat_id: chatId,
                        revoke_messages: true
                    })
                } catch (error) {

                }

            }
        }

    }
})

bot.startPolling()
