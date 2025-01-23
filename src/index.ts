import express from 'express';
import serverConfig from './config/serverConfig';
import apiRouter from './routes';


const app = express();
app.use('/api', apiRouter)
app.listen(serverConfig.PORT, ()=>{
    console.log(`Server started on port ${serverConfig.PORT}`);
    console.log('Press CTRL + C to stop the server');
})