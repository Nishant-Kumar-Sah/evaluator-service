import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeEexecutorStrategy";
import { CPP_IMAGE } from "../utils/constants"
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";
import pullImage from "./pullImage"
import Dockerode from 'dockerode'



class CppExecutor implements CodeExecutorStrategy{
    async execute(code: string, inputTestCase: string,outputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];
        await pullImage(CPP_IMAGE)
        console.log("Initialising a new CPP container")
        let runCommand = `echo '${code.replace(/'/g,`'\\"`)}' > main.cpp && g++ main.cpp -o main  && echo '${inputTestCase.replace(/'/g,`'\\"`)}' | stdbuf -oL -eL ./main`
        const cppDockerContainer = await createContainer(CPP_IMAGE, ['/bin/sh','-c', runCommand])
        await cppDockerContainer.start()
        console.log("Container Created:", cppDockerContainer.id)

        const loggerStream = await cppDockerContainer.logs({
            stdout: true,
            stderr: true,
            timestamps: false,
            follow: true
        })
        loggerStream.on('data', (chunk)=>{
            rawLogBuffer.push(chunk)
        })

        try {
            const codeResponse : string = await this.fetchDecodedStream(loggerStream, rawLogBuffer)
            codeResponse.replace("\n", " ")

            if(codeResponse.trim() === outputTestCase.trim()){
                return {output: codeResponse, status: "SUCCESS"}
            }
            else 
                return {output: codeResponse, status: "WA"}
        }catch (error){
            console.log('Error Occured: ', error)
            if(error === "TLE") {
                await cppDockerContainer.kill()
            }
            return {output: error as string, status: "ERROR"}
        }finally {
            await cppDockerContainer.remove()
        }
    }
    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]):Promise<string>{
        return  new Promise((resolve, reject) =>{
            const timeout = setTimeout(() => {
                console.log("Timeout Called");
                reject('TLE')
            },2000)
            loggerStream.on('end', () => {
                clearTimeout(timeout)
                console.log("Raw Log buffer", rawLogBuffer)
                const completeBuffer = Buffer.concat(rawLogBuffer)
                const decodedStream = decodeDockerStream(completeBuffer)
                console.log('Decoded Buffer', decodedStream)
                console.log('Decode dStream stdout', decodedStream.stdout)
                if(decodedStream.stderr) {
                    resolve(decodedStream.stderr)
                }else {
                    resolve(decodedStream.stdout)
                }
            })
        })
    }
}


export default CppExecutor;





