const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const {Server} =require('socket.io');
const prisma = require('./prisma');
const telegramService = require('./services/telegramService');
const authRoutes = require('./routes/authRoute');
const orgRoutes  = require('./routes/organizationsRoute');
const inviteRoutes = require('./routes/invitesRoute');
const userRoutes = require('./routes/usersRoute');
const ticketRoutes = require('./routes/ticketsRoute');
const messageRoutes = require('./routes/messageRoute');
const channelsRoutes = require('./routes/channelsRoute');
const { checkServerIdentity } = require('tls');

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:'*'
    }
});

app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/organizations',orgRoutes);
app.use('/api/invite',inviteRoutes);
app.use('/api/users',userRoutes);
app.use('/api/tickets',ticketRoutes);
app.use('/api/tickets/:ticketId/messages', messageRoutes);
app.use('/api/channels', channelsRoutes);

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

io.on('connection',(socket)=>{
    console.log('Пользователь подключился: ', socket.id);

    socket.on('join_ticket', (ticketId)=>{
        socket.join(ticketId);
        console.log(`Пользователь ${socket.id} вошел в тикет ${ticketId} `);
    });
    socket.on('leave_ticket',(ticketId)=>{
        socket.leave(ticketId);
        console.log(`Пользователь ${socket.id} покинул тикет ${ticketId}`);
    });
    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
    });

});
app.set('io',io);

telegramService.startAllBots()
    .then(() => console.log('Все телеграм боты запущены '))
    .catch(err=>console.error('Ошибка заргузки ботов: ', err))


const PORT = process.env.PORT || 3000
server.listen(PORT,()=>{
    console.log('Сервер запущен порту ' + PORT);
})
