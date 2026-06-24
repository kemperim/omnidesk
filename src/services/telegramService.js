const { Telegraf } = require('telegraf');
const prisma = require('../prisma');
const aiService = require('./aiService');
const ticketService = require('./ticketService');

const activeBots = {};

exports.startBot = async (channel) => {
  if (activeBots[channel.id]) {
    console.log(`Бот для канала ${channel.id} уже запущен`);
    return;
  }

  const { bot_token } = channel.config;
  const bot = new Telegraf(bot_token);

  bot.on('text', async (ctx) => {
    try {
      const chatId = ctx.chat.id.toString();
      const text = ctx.message.text;
      const firstName = ctx.from.first_name || '';
      const lastName = ctx.from.last_name || '';
      const name = `${firstName} ${lastName}`.trim();

      let client = await prisma.client.findFirst({
        where: { telegramId: chatId, orgId: channel.orgId }
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: name || 'Telegram пользователь',
            email: `telegram_${chatId}@omnidesk.kz`,
            telegramId: chatId,
            orgId: channel.orgId
          }
        });
        console.log('Новый клиент создан:', client.name);
      }

      let aiResult = null;
      try {
        aiResult = await aiService.classifyTicket(text, text);
      } catch (e) {
        console.error('AI ошибка:', e.message);
      }

      // Найти или создать тикет
      const ticket = await ticketService.findOrCreateTicket({
        clientId: client.id,
        orgId: channel.orgId,
        channel: 'telegram',
        subject: text.substring(0, 100),
        message: text,
        aiResult
      });

      if (ticket.createdAt === ticket.updatedAt) {
        await ctx.reply('Здравствуйте! Ваше обращение принято. Мы свяжемся с вами в ближайшее время.');
        console.log(`Новый тикет создан: ${ticket.id}`);
      } else {
        await ctx.reply('Ваше сообщение получено! Оператор ответит вам в ближайшее время.');
        console.log(`Сообщение добавлено в тикет ${ticket.id}`);
      }

    } catch (error) {
      console.error('Ошибка обработки сообщения:', error.message);
    }
  });

  bot.launch();
  activeBots[channel.id] = bot;
  console.log(`Бот запущен для организации: ${channel.orgId}`);
};

exports.stopBot = async (channelId) => {
  if (activeBots[channelId]) {
    activeBots[channelId].stop();
    delete activeBots[channelId];
    console.log(`Бот остановлен для канала: ${channelId}`);
  }
};

exports.sendMessage = async (channelId, telegramId, text) => {
  const bot = activeBots[channelId];
  if (!bot) {
    console.error('Бот не найден для канала:', channelId);
    return;
  }
  await bot.telegram.sendMessage(telegramId, text);
};

exports.startAllBots = async () => {
  const channels = await prisma.channel.findMany({
    where: { type: 'telegram', isActive: true }
  });

  console.log(`Найдено ${channels.length} Telegram каналов`);

  for (const channel of channels) {
    await exports.startBot(channel);
  }
};