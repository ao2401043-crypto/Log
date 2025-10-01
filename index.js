const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function generateMessageImage(author, content) {
  const background = await Canvas.loadImage("./background.png");
  const canvas = Canvas.createCanvas(800, 200);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const avatar = await Canvas.loadImage(author.displayAvatarURL({ extension: "png" }));
  ctx.drawImage(avatar, 20, 60, 60, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.fillText(author.tag, 100, 90);

  ctx.fillStyle = "#dddddd";
  ctx.font = "18px Arial";
  ctx.fillText(content || "لا يوجد نص.", 100, 130);

  return new AttachmentBuilder(canvas.toBuffer(), { name: "message.png" });
}

// 🗑️ لوق الحذف
client.on("messageDelete", async (message) => {
  if (message.partial || !message.author || message.author.bot) return;

  const logChannel = await message.guild.channels.fetch("ضع_ايدي_الروم_هنا");
  if (!logChannel) return;

  const attachment = await generateMessageImage(message.author, message.content);

  const embed = new EmbedBuilder()
    .setTitle("🗑️ MESSAGE DELETED")
    .setDescription(`
👤 **العضو:** ${message.author}
🕒 **تاريخ الإرسال:** <t:${Math.floor(message.createdTimestamp / 1000)}:F>
🗑️ **تاريخ الحذف:** <t:${Math.floor(Date.now() / 1000)}:F>
📝 **المحتوى:** ${message.content || "رسالة بدون نص"}
    `)
    .setColor(0xFF0000)
    .setImage("attachment://message.png")
    .setTimestamp();

  // لو في صورة بالرسالة
  if (message.attachments.size > 0) {
    embed.addFields({ name: "📷 مرفق", value: message.attachments.first().url });
  }

  await logChannel.send({ embeds: [embed], files: [attachment] });
});

// ✏️ لوق التعديل
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (oldMessage.partial || newMessage.partial) return;
  if (!oldMessage.author || oldMessage.author.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const logChannel = await newMessage.guild.channels.fetch("ضع_ايدي_الروم_هنا");
  if (!logChannel) return;

  const attachment = await generateMessageImage(newMessage.author, newMessage.content);

  const embed = new EmbedBuilder()
    .setTitle("✏️ MESSAGE EDITED")
    .setDescription(`
👤 **العضو:** ${newMessage.author}
🕒 **تاريخ الإرسال:** <t:${Math.floor(newMessage.createdTimestamp / 1000)}:F>
✏️ **تاريخ التعديل:** <t:${Math.floor(Date.now() / 1000)}:F>

**قبل:** ${oldMessage.content || "فارغ"}
**بعد:** ${newMessage.content || "فارغ"}
    `)
    .setColor(0xFFA500)
    .setImage("attachment://message.png")
    .setTimestamp();

  await logChannel.send({ embeds: [embed], files: [attachment] });
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
