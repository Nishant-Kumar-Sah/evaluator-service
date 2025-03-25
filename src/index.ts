import express,{Express} from 'express';
import bodyParser from 'body-parser';


import serverConfig from './config/serverConfig';
import apiRouter from './routes';
import sampleQueueProducer from './producers/sampleQueueProducer';
import SampleWorker from './workers/SampleWorker';
import serverAdapter from './config/bullBoardConfig';
import runPython from './containers/pythonExecutor';
import runJava from './containers/javaExecutor';
import runCpp from './containers/cppExecutor';
import SubmissionWorker from './workers/SubmissionWorker';
import { submission_queue } from './utils/constants';
import submissionQueueProducer from './producers/submissionQueueProducer';
import CppExecutor from './containers/cppExecutor';


const app:Express = express();
app.use(bodyParser.text ())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : true }))


app.use('/api', apiRouter)
app.use('/ui', serverAdapter.getRouter())
app.listen(serverConfig.PORT, ()=>{
    console.log(`Server started on port ${serverConfig.PORT}`);
    SampleWorker('SampleQueue')
    SubmissionWorker(submission_queue)
    // sampleQueueProducer('SampleJob',{
    //     name:'Nishant',
    //     company:'GO',
    //     position:'SDET',
    //     location:'ggn'
    // },2);
    // sampleQueueProducer('SampleJob',{
    //     name:'soujash',
    //     company:'wishlink',
    //     position:'sde',
    //     location:'ggn'
    // },1);


//     const code = `
//     import java.util.*;
//     public class Main{
//         public static void main(String[] args) {
//             Scanner S1 = new Scanner(System.in);
//             int input = S1.nextInt();
//             System.out.println("Input given by user : " + input);
//             for(int i = 0; i < input; i++) {
//                 System.out.println(i);
//             }
//         }
//     }
// `;

    const code = `
    #include <iostream>
    using namespace std;
    int main() {
        int input;
        cin >> input;
        cout << "Number input by user:" << input<<endl;
        for(int i = 0; i < input; i++) {
            cout << i << endl;
        }
        return 0;
    }
    `

    const inputCase = `5`

    submissionQueueProducer({"1234":{
            language:"CPP",
            inputCase,
            code
        }
    })
    // new CppExecutor(code,inputCase)
})

