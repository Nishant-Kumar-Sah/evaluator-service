import Docker from 'dockerode'

import createContainer from './containerFactory'
// import {  TestCases } from '../types/testCases'
import { PYTHON_IMAGE } from '../utils/constants'
import pullImage from './pullImage';
import { decodeDockerStream } from './dockerHelper';
import CodeExecutorStrategy, { ExecutionResponse } from '../types/codeEexecutorStrategy';

class PythonExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string,outputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer : Buffer[] =[]
        await pullImage(PYTHON_IMAGE);

        console.log("Initialising a new python docker container")
        let runCommand = `echo '${code.replace(/'/g,`'\\"`)}' > test.py  && echo '${inputTestCase.replace(/'/g,`'\\"`)}' | python3 test.py`
        const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['/bin/sh','-c',runCommand ])

        await pythonDockerContainer.start()
        console.log("Container Created:", pythonDockerContainer.id)

        const loggerStream = await pythonDockerContainer.logs({
            stdout:true,
            stderr:true,
            timestamps: false,
            follow: true
        })

        loggerStream.on('data', (chunk)=>{
            rawLogBuffer.push(chunk)
        })
        try{
            const codeResponse: string = await this.fetchDecodedStream(loggerStream, rawLogBuffer)
            if(codeResponse.trim() === outputTestCase.trim()){
                return {output: codeResponse, status: "SUCCESS"}
            }
            else 
                return {output: codeResponse, status: "WA"}
        }catch(error) {
            if(error === "TLE"){
                await pythonDockerContainer.kill()
            }
            return {output: error as string, status:"ERROR"}
        }finally{
            await pythonDockerContainer.remove()
        }
    }

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]):Promise<string>{
        return new Promise((res, reject)=>{
            const timeout = setTimeout(() => {
                console.log("Timeout Called")
                reject("TLE")
            }, 2000)
            loggerStream.on('end',() =>{
                console.log("Raw Log buffer" ,rawLogBuffer)
                const completeBuffer = Buffer.concat(rawLogBuffer)
                const decodedStream = decodeDockerStream(completeBuffer)
                console.log('Decoded Buffer' , decodedStream)
                console.log('Decode stream stdout', decodedStream.stdout)
                if(decodedStream.stderr) {
                    res(decodedStream.stderr)
                }else {
                    res(decodedStream.stdout)
                }
                
            })
            
        })
    }
}


export default PythonExecutor;