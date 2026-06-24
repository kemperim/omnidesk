const prisma = require('../prisma');
const telegramService = require('../services/telegramService');
const whatsapService = require('../services/whatsappgrenapiService');
exports.getAll = async(req,res)=>{
    try{
        const{ticketId} = req.params;
        const{orgId} = req.user;

        const ticket = await prisma.ticket.findFirst({
            where:{
                id:ticketId,
                orgId
            }
        });
        if(!ticket){
            return res.status(404).json({message:'Тикет не найден'});
        }
        const messages = await prisma.message.findMany({
            where:{ticketId},
            orderBy:{createdAt:'asc'}
        });
        res.json(messages);

    }catch(error){
        res.status(500).json({message:'Ошибка сервера ', error: error.message});
    }
};

exports.create  = async(req,res) =>{
    try{

        const {ticketId} = req.params;
        const {content} = req.body;
        const {id, orgId, role} = req.user;
        
        if(!content){
            return res.status(400).json({message: 'Сообщение не может быть пустым'});
        }

        const ticket  = await prisma.ticket.findFirst({
            where:{id: ticketId, orgId},
            include:{client:true}
        });
        if(!ticket){
            return res.status(404).json({message:'Тикет не найден'});
        }
        if (ticket.status === 'closed'){
            return res.status(400).json({message: 'Тикет закрыт'})
        }

        const message = await prisma.message.create({
            data:{
                ticketId,
                senderId:id,
                senderType:'operator',
                content
            }
        });

        if(ticket.status === 'new'){
            await prisma.ticket.update({
                where:{id:ticketId},
                data:{status:'in_progress'}
            });
        }

        const io = req.app.get('io');
        io.to(ticketId).emit('new_message', message);
        
        if(ticket.channel === 'telegram' && ticket.client.telegramId){
            const channel = await prisma.channel.findFirst({
                where:{orgId, type:'telegram', isActive:true}
            });
            if (channel){
                await telegramService.sendMessage(channel.id, ticket.client.telegramId, content);
            }
        }

        if(ticket.channel === 'whatsapp' && ticket.client.whatsappId){
            const channel = await prisma.channel.findFirst({
                where:{
                    orgId,
                    type:'whatsapp',
                    isActive: true
                }
            });
            if(channel){
                await whatsapService.sendMessage(channel, ticket.client.whatsappId, content);
            }
        }
        res.status(201).json({message:'Сообщение отправлено', data:message});

    }catch(error){
        res.status(500).json({message:'Ошибка сервера ', error: error.message});
    }
}