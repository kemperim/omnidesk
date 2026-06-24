const prisma = require('../prisma');

exports.findOrCreateTicket = async ({ clientId, orgId, channel, subject, message, aiResult }) => {
  // Ищем открытый тикет
  const openTicket = await prisma.ticket.findFirst({
    where: {
      clientId,
      orgId,
      status: { in: ['new', 'in_progress'] }
    }
  });

  if (openTicket) {
    // Добавляем сообщение в существующий тикет
    await prisma.message.create({
      data: {
        ticketId: openTicket.id,
        senderId: clientId,
        senderType: 'client',
        content: message
      }
    });
    return openTicket;
  }

  // Создаём новый тикет
  const ticket = await prisma.ticket.create({
    data: {
      subject,
      channel,
      orgId,
      clientId,
      status: 'new',
      priority: aiResult?.priority || 'medium',
      aiSummary: aiResult?.summary || null,
      aiRaw: aiResult || null
    }
  });

  await prisma.message.create({
    data: {
      ticketId: ticket.id,
      senderId: clientId,
      senderType: 'client',
      content: message
    }
  });

  return ticket;
};