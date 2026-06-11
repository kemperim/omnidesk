const crypto = require('crypto');
const prisma = require('../prisma');
const mailService = require('../services/mailService');
const bcrypt = require('bcrypt');

exports.create = async(req,res)=>{
    try{
        const{email,role} = req.body;
        const orgId = req.user.orgId

        if (!email || !role) {
            return res.status(400).json({ message: 'Email и роль обязательны' });
        }

        const organization = await prisma.organization.findUnique({
            where:{id:orgId}
        });
        if (!organization) {
            return res.status(404).json({ message: 'Организация не найдена' });
        }

        const existingUser = await prisma.user.findUnique({
            where:{email}
        });
        if(existingUser){
            return res.status(400).json({message:'Пользователь с таким email уже существует! '});
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now()+24*60*60*1000);

        const invite = await prisma.invite.create({
            data:{email, role,token,orgId, expiresAt}
        });

        await mailService.sendInvite({
            email,
            subdomain:organization.subdomain,
            token,
            role
        })
        res.status(201).json({message:'Приглашение отправлено', invite});

    }catch(error){
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

exports.accept = async(req,res)=>{
    try{
        const {token, name, password} = req.body;
        if (!token || !name || !password) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }
       
        const invite = await prisma.invite.findUnique({
            where: { token }
        });
        if (!invite) {
            return res.status(404).json({ message: 'Приглашение не найдено' });
        }else if (invite.expiresAt < new Date() || invite.usedAt){
            return res.status(400).json({message:'Приглашение истекло!'})
        }

        const passwordHash = await bcrypt.hash(password,10);
         const user = await prisma.user.create({
            data: {
                name,
                email: invite.email,
                passwordHash,
                role: invite.role,
                orgId: invite.orgId
            }
    });
    res.status(201).json({ message: 'Аккаунт создан! Теперь можете войти.' });
   
   
    }catch(error){
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}