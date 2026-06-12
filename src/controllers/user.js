const prisma = require('../prisma');
exports.getAll =async (req,res)=>{
    try{
        const{orgId} = req.user;
        const users = await prisma.user.findMany({
            where:{orgId},
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            },
            orderBy: {createdAt:'desc'}
        });
        res.json(users);

    }catch(error){
        res.status(500).json({message: "Ошибка сервера: ", error: error.message});
    }
}

exports.getOne = async(req,res)=>{
    try{
        const{id} = req.params;
        const{orgId}=req.user;
        const user = await prisma.user.findFirst({
            where: { id, orgId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        if(!user){
            return res.status(404).json({message:"Пользователь не найден!"});
        }
        res.json(user);

    }catch(error){
         res.status(500).json({message: "Ошибка сервера: ", error: error.message});
    }
}

exports.update = async(req,res)=>{
    try{
        const{id}=req.params;
        const{orgId}=req.user;
        const{name, role,isActive} = req.body;

        const existingUser = await prisma.user.findFirst({
            where:{
                id:id,
                orgId:orgId
            }
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = await prisma.user.update({
            where:{id},
            data:{name,role,isActive},
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                isActive:true
            }
        });
        res.status(201).json({message:'Пользователь обновлен! ', user});

    }catch(error){
        res.status(500).json({message: "Ошибка сервера: ", error: error.message});
    }
}

exports.delete = async(req,res)=>{
    try{
        const {id} = req.params;
        const {orgId} = req.user;

        const existingUser = await prisma.user.findFirst({
            where:{
                id:id,
                orgId:orgId
            }
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        await prisma.user.delete({where:{id}});
        res.status(200).json({message:"Пользователь успешно удален"});
        

    }catch(error){
        res.status(500).json({message: "Ошибка сервера: ", error: error.message});
    }
}