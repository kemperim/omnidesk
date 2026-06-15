const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const prisma = require('./prisma');
const authRoutes = require('./routes/authRoute');
const orgRoutes  = require('./routes/organizationsRoute');
const inviteRoutes = require('./routes/invitesRoute');
const userRoutes = require('./routes/usersRoute');
const ticketRoutes = require('./routes/ticketsRoute');
const messageRoutes = require('./routes/messageRoute');

const app = express();

app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/organizations',orgRoutes);
app.use('/api/invite',inviteRoutes);
app.use('/api/users',userRoutes);
app.use('/api/tickets',ticketRoutes);
app.use('/api/tickets/:ticketId/messages', messageRoutes);
app.get('/', async (req,res)=>{

    
    try{
        await prisma.$queryRaw `SELECT 1`;

        res.json({
            message: 'Сервер работает!',
            database: 'Подключение к базе данных установленно'            
        });

    }catch(error){
        res.json({
            message:'Сервер работает',
            database: '',
            error:error.message
        });
    }
    });

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log('Сервер запущен порту ' + PORT);
})
