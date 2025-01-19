import express from 'express';
import serverConfig from './config/serverConfig';


const app = express();
app.listen(serverConfig.PORT, ()=>{
    console.log(`Server started on port ${serverConfig.PORT}`);
    console.log('Press CTRL + C to stop the server');
})