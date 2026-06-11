const prisma = require('../prisma');

exports.create = async(req, res) =>{
    try{
        const{name, subdomain} = req.body;
        if(!name||!subdomain){
            return res.status(400).json({message: 'Название и субдомен обязательны'});
        }

        const existingOrg = await prisma.organization.findUnique({
            where:{subdomain}
        });
        if(existingOrg){
            return res.status(400).json({message:'Субдомен уже занят'});
        }

        const organization = await prisma.organization.create({
            data:{name,subdomain}
        });
        res.status(201).json({
            message:"Организация созданна",
            name:organization
        })

    }catch(error){
        res.status(500).json({message: "Ошибка сервера: ", error: error.message});
    }

}

exports.getAll = async(req,res)=>{
    try{
        const organizations = await prisma.organization.findMany({
            orderBy: {createdAt:'desc'}
        });
        res.json(organizations);
    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error:error.message});
    }
};

exports.getOne = async(req,res)=>{
    try{
        const{id} = req.params;
        const organization = await prisma.organization.findUnique({
            where:{id:id}
        })
        if (!organization){
            return res.status(404).json({message:'Организация не найдена!'});
        }
        res.json(organization);
    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error:error.message});
    }
    };
