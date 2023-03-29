const app = require('express')();

const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

require("dotenv").config();

// const web3 = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

const web3 = new ethers.providers.JsonRpcProvider(process.env.RPC);

GK_ADDRESS = process.env_CONTRACT_ADDRESS;
GK_ABI = require('../GATEKEEPER_ABI.json');

const GK = new ethers.Contract(GK_ADDRESS, GK_ABI, web3);

//create a get route with an id as parameter
app.get('/:id', async (req, res) => {
    const { id } = req.params;
    // do something with the id
    let chatId = await GK.roomIds(id);
    let infos = await bot.telegram.getChat(chatId.toString());
    let photo = await bot.telegram.getFileLink(infos.photo.big_file_id);
    console.log(photo);
    console.log({
        name: infos.title,
        description: `The key to the telegram channel: ${infos.title}. Only holders of the NFT can access the group. Use @gatekeeper_muse_bot to join the group.`,
        image: photo.href,
    })
};

module.exports = app;
