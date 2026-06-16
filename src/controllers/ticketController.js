const { stat } = require('node:fs');
const prisma = require('../prisma')
const aiService = require('../services/aiService');
exports.create = async(req,res)=>{
    try{
        const {subject, message, channel, clientId,orgId} = req.body;
    
        if(!subject || !message || !channel){
            return res.status(400).json({ message: 'Тема, сообщение и канал обязательны' });
        }

        const org = await prisma.organization.findUnique({
            where: { id: orgId }
        });
        if (!org) {
             return res.status(404).json({ message: 'Организация не найдена' });
        }

        const client = await prisma.client.findUnique({
            where: { id: clientId, orgId }
        });
        if (!client) {
            return res.status(404).json({ message: 'Клиент не найден' });
        }
        let aiResult = null
        try{
            aiResult = await aiService.classifyTicket(subject,message);
        }catch(aiError){
            console.error('AI ошибка', aiError.message)
        }

        const ticket = await prisma.ticket.create({
            data:{
                clientId,
                subject,
                channel,
                orgId,
                status:'new',
                priority: aiResult?.priority || 'medium',
                aiSummary: aiResult?.summary || null,
                aiRaw: aiResult || null
            }
        });
        
        await prisma.message.create({
            data:{
                ticketId: ticket.id,
                senderId: clientId,
                senderType:'client',
                content: message
            }
        });
        res.status(201).json({message:'Тикет создан', ticket});
    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error: error.message});
    }
}

exports.getAll = async(req,res) =>{
    try{
        const{orgId} = req.user;
        const{status, priority, channel} = req.query;

        const where = {orgId}
        if(status) where.status = status;
        if(priority) where.priority = priority;
        if(channel) where.channel = channel;

        const tickets = await prisma.ticket.findMany({
            where,
            include:{
                client:{
                    select:{id:true, name:true, email:true}
                },
                operator:{
                    select:{id:true,name:true}
                },
                category:{
                    select:{id:true,name:true,color:true}
                },
                messages:{
                    orderBy:{createdAt:'desc'},
                    take:1
                }
            },
            orderBy:{createdAt:'desc'}
        });
        res.json(tickets)
    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error: error.message});
    }
};

exports.getOne = async (req,res)=>{
    try{
        const {id} = req.params;
        const {orgId} = req.user;

        const ticket = await prisma.ticket.findFirst({
        where: { id, orgId },
        include: {
            client: {
                select: { id: true, name: true, email: true, phone: true }
            },
            operator: {
                select: { id: true, name: true }
            },
            category: {
                select: { id: true, name: true, color: true }
            },
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if(!ticket){
        return res.status(404).json({message:'Тикет не найден'});
    }
    res.json(ticket);

    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error: error.message});
    }
};
exports.update = async(req,res)=>{
    try{
        const {id} = req.params;
        const {orgId} = req.user;
        const {status,priority, operatorId, categoryId} = req.body;
        
        const existingTicket = await prisma.ticket.findFirst({
            where: { id, orgId }
        });
        if (!existingTicket) {
            return res.status(404).json({ message: 'Тикет не найден' });
        }
        
        const closedAt = status === 'closed' ? new Date() : existing.closedAt;
        const ticket = await prisma.ticket.update({
            where:{id},
            data:{status,priority,operatorId, categoryId, closedAt}
        });
        res.json({message:'Тикет обновлен', ticket})

    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error: error.message});
    }
}