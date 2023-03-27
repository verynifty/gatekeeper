const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

require("dotenv").config();

// const web3 = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

const web3 = new ethers.providers.JsonRpcProvider(process.env.RPC);

GK_ADDRESS = process.env.CONTRACT_ADDRESS;
GK_ABI = require('./GATEKEEPER_ABI.json');

const GK = new ethers.Contract(GK_ADDRESS, GK_ABI, web3);

const gk_iface = new ethers.utils.Interface(GK_ABI);

const bot = new Telegraf(process.env.TELEGRAM);

(async function() {
    let chatId = await GK.roomIds(1);
    let infos = await bot.telegram.getChat(chatId.toString());
    let photo = await bot.telegram.getFileLink(infos.photo.big_file_id);
    console.log(photo);
    console.log({
        name: infos.title,
        description: `The key to the telegram channel: ${infos.title}. Only holders of the NFT can access the group. Use @gatekeeper_muse_bot to join the group.`,
        image: photo.href,
    })
  })();