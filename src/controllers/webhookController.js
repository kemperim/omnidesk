const prisma = require('../prisma');
const whatsappService = require('../services/whatsappgrenapiService');
exports.whatsapp = async(req,res) =>{
    try{
        const {channelId} = req.params;
        const channel = await prisma.channel.findUnique({
            where:{id:channelId}
        });
         if(!channel || channel.type !=='whatsapp'){
            return res.status(404).json({message:'Канал не найден'});
         }
         await whatsappService.handleWebhook(req.body,channel);
         res.status(200).json({message:'ok'});

    }catch(error){
         res.status(500).json({message: "Ошибка сервера: ", error: error.message});
    }
}