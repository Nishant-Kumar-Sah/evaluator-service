import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeEexecutorStrategy";
import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";
import pullImage from "./pullImage";
import Dockerode from 'dockerode'

class JavaExecutor implements CodeExecutorStrategy {

    async execute(code: string, inputTestCase: string, outputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];
        await pullImage(JAVA_IMAGE)

        console.log("Initialising a new JAVA docker container")
        let runCommand = `echo '${code.replace(/'/g,`'\\"`)}' > Main.java && javac Main.java  && echo '${inputTestCase.replace(/'/g,`'\\"`)}' | java Main`
        const javaDockerContainer = await createContainer(JAVA_IMAGE, ['/bin/sh','-c',runCommand ])

        await javaDockerContainer.start()
        console.log("Java Docker Container started", javaDockerContainer.id)

        const loggerStream = await javaDockerContainer.logs({
            stdout: true,
            stderr: true,
            timestamps: false,
            follow: true
        })

        loggerStream.on('data',(chunk)=>{
            rawLogBuffer.push(chunk)
        })

        try {
            const codeResponse : string = await this.fetchDecodedStream(loggerStream, rawLogBuffer)
            if(codeResponse.trim() === outputTestCase.trim()){
                return {output: codeResponse, status: "SUCCESS"}
            }
            else 
                return {output: codeResponse, status: "WA"}
        }catch (error){
            console.log('Error Occured: ', error)
            if(error === "TLE") {
                await javaDockerContainer.kill()
            }
            return {output: error as string, status: "ERROR"}

        }finally{
            await javaDockerContainer.remove()
        }
            
    }
        // move this to utils file
        fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]):Promise<string>{
            return new Promise((resolve, reject)=>{
                const timeout = setTimeout(() => {
                    console.log("Timeout Called");
                    reject('TLE')
                },2000)
                loggerStream.on('end', () => {
                    clearTimeout(timeout)
                    console.log('Raw Log Buffer', rawLogBuffer)
                    const completeBuffer = Buffer.concat(rawLogBuffer)
                    const decodedStream = decodeDockerStream(completeBuffer)
                    console.log('Decoded Buffer' , decodedStream)
                    console.log('Decode stream stdout', decodedStream.stdout)
                    if(decodedStream.stderr) {
                        resolve(decodedStream.stderr)
                    }else {
                        resolve(decodedStream.stdout)
                    }
                })
            })
        }
}



export default JavaExecutor;