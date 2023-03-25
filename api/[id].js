
const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

require("dotenv").config();

// const web3 = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

const web3 = new ethers.providers.JsonRpcProvider(process.env.RPC);

const GK_ADDRESS = process.env_CONTRACT_ADDRESS;
const GK_ABI = require('../GATEKEEPER_ABI.json');

const GK = new ethers.Contract(process.env.CONTRACT_ADDRESS, GK_ABI, web3);
export default async function handler(req, res) {
    res.statusCode = 200;
    const id = req.query.id;

    res.setHeader('Content-Type', 'application/json');
    let chatId = await GK.roomIds(id);
    let chatInfo = await bot.telegram.getChat(chatId.toString())
    res.json(chatInfo);
  }