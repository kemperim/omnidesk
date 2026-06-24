const prisma = require('../prisma');
const telegramService = require('../services/telegramService');

exports.getAll = async(req, res) =>{
    try{
        const {orgId} = req.user;

        const channels = await prisma.channel.findMany({
            where: {orgId},
            orderBy:{createdAt:'desc'}
        });

        const safeChannels = channels.map(ch => ({
            ...ch,
            config: { type: ch.type }
        }));
        res.json(safeChannels);
    }catch(error){
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }    
}

exports.create = async(req,res)=>{
    try{
        const {orgId} = req.user;
        const {type,name,config} = req.body;

        if (!type || !name || !config){
            return res.status(400).json({message:'Тип, название и настройки обязательны '});
        }

        if(type ==='whatsapp'){
            if(!config.instance_id || !config.api_tokenn || !config.api_url){
                return res.status(400).json({ 
                    message: 'Для WhatsApp нужны: instance_id, api_token, api_url' 
                });
            }
        }
        if(type==='telegram'){
            if(!config.bot_token){
                return res.status(400).json({
                    message:'Для телеграма нужен bot_token'
                });
            }
        }

        const existingChannel = await prisma.channel.findFirst({
            where:{orgId, type}
        });
        if(existingChannel){
            return res.status(400).json({ message: 'Канал уже подключен' });
        }

        const channel = await prisma.channel.create({
            data:{type, name,    config, orgId}
        });

        if (type === 'telegram'){
            await telegramService.startBot(channel);
        }
        res.status(201).json({message:'Канал подключен', channel});

    }catch(error){
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.update = async(req,res)=>{
    try{
        const {id} = req.params;
        const {orgId} = req.user;
        const {name,config, isActive} = req.body;

        const existingChannel = await prisma.channel.findFirst({
            where:{id,orgId}
        });
        if(!existingChannel){
            return res.status(404).json({ message: 'Канал не найден' });
        }
        
        const channel = await prisma.channel.update({
            where:{id},
            data:{name, config, isActive}
        });

        if(existingChannel.type == 'telegram'){
            await telegramService.stopBot(id);
            if (isActive){
                await telegramService.startBot(channel);
            }
        }
        res.status(200).json({message:'Канал обновлен ', channel});

    }catch(error){
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

exports.delete = async(req,res) =>{
    try{
        const{id} = req.params;
        const{orgId} = req.user;

        const existingChannel = await prisma.channel.findFirst({
            where:{id,orgId}
        });
        if(!existingChannel){
            return res.status(404).json({ message: 'Канал не найден' });
        }

        if(existingChannel.type ==='telegram'){
            await telegramService.stopBot(id);
        }
        await prisma.channel.delete({where:{id}});

        res.json({message: 'Канал удален'});
        
    }catch(error){
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }

}

