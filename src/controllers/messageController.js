const prisma = require('../prisma');

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
            where:{id: ticketId, orgId}
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

        res.status(201).json({message:'Сообщение отправлено', data:message});

    }catch(error){
        res.status(500).json({message:'Ошибка сервера ', error: error.message});
    }
}