import express from 'express';


import serverConfig from './config/serverConfig';
import apiRouter from './routes';
import sampleQueueProducer from './producers/sampleQueueProducer';
import SampleWorker from './workers/SampleWorker';
import serverAdapter from './config/bullBoardConfig';


const app = express();
app.use('/api', apiRouter)
app.use('/ui', serverAdapter.getRouter())
app.listen(serverConfig.PORT, ()=>{
    console.log(`Server started on port ${serverConfig.PORT}`);
    SampleWorker('SampleQueue')
    sampleQueueProducer('SampleJob',{
        name:'Nishant',
        company:'GO',
        position:'SDET',
        location:'ggn'
    },2);
    sampleQueueProducer('SampleJob',{
        name:'soujash',
        company:'wishlink',
        position:'sde',
        location:'ggn'
    },1);
})

