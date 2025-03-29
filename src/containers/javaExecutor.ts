import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeEexecutorStrategy";
import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";
import pullImage from "./pullImage";

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
            return {output: codeResponse, status: "COMPLETED"}
        }catch (error){
            return {output: error as string, status: "ERROR"}

        }finally{
            await javaDockerContainer.remove()
        }
            
    }
        fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]):Promise<string>{
            return new Promise((resolve, reject)=>{
                loggerStream.on('end', () => {
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