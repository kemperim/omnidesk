const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const generateTokens = (user)=>{
    const accessToken = jwt.sign(
        {id:user.id, role:user.role, orgId: user.orgId},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_ACCESS_EXPIRES}
    );

    const refreshToken = jwt.sign(
        {id:user.id},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_REFRESH_EXPIRES}
    );
    return {accessToken, refreshToken};
};

exports.login = async (req , res) =>{
    try{
        const {email, password} = req.body

        const user = await prisma.user.findUnique({
            where:{email}
        });
        if(!user){
            return res.status(401).json({message:'Неверный логин или пароль!'});
        }

        const isPassValid = await bcrypt.compare(password, user.passwordHash);
        if(!isPassValid){
            return res.status(401).json({message:'Неверный логин или пароль!'});
        }
        if(!user.isActive){
            return res.status(403).json({message:'Аккаунт заблокирован!'});
        }

        const{accessToken,refreshToken} =generateTokens(user);

        res.json({
            accessToken,
            refreshToken,
            user:{
                id:user.id,
                name: user.name,
                email:user.email,
                role:user.role,
                orgId:user.orgId
            }
        });

    }catch(error){
        res.status(500).json({message:"Запрос недоступен!"});
    }
};

exports.me= async (req,res)=>{
    try{
        const user = await prisma.user.findUnique({
            where: {id:req.user.id},
            select:{
                id:true,
                orgId:true,
                name:true,
                email:true,
                role:true,
                isActive:true,
                createdAt:true,
                updatedAt:true
            }
        });
        res.json(user)

    }catch(error){
        res.status(500).json({message:'Ошибка сервера', error:error.message});
    }
};