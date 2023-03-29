
const { Telegraf, Scenes, session } = require('telegraf')
const { message } = require("telegraf/filters");

const { ethers } = require("ethers");

require("dotenv").config();


const web3 = new ethers.providers.JsonRpcProvider(process.env.RPC);

const GK_ADDRESS = process.env_CONTRACT_ADDRESS;
const GK_ABI = require('../GATEKEEPER_ABI.json');

const GK = new ethers.Contract(process.env.CONTRACT_ADDRESS, GK_ABI, web3);

const bot = new Telegraf(process.env.TELEGRAM);


export default async function handler(req, res) {
  res.statusCode = 200;
  const id = req.query.id;

  res.setHeader('Content-Type', 'application/json');
  let chatId = await GK.roomIds(id);
  let infos = await bot.telegram.getChat(chatId.toString());
  let photo = await bot.telegram.getFileLink(infos.photo.big_file_id);
  res.json({
    name: infos.title,
    description: `The key to the telegram channel: ${infos.title}. Only holders of the NFT can access the group. Use @gatekeeper_muse_bot to join the group.`,
    image: photo.href,
  });
}