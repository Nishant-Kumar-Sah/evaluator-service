import { CPP_IMAGE } from "../utils/constants"
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";
import pullImage from "./pullImage"

async function runCpp(code: string, inputTestCase: String) {
    const rawLogBuffer: Buffer[] = []
    await pullImage(CPP_IMAGE);
    
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

    await new Promise((resolve, reject) =>{
        loggerStream.on('end', () => {
            console.log("Raw Log buffer", rawLogBuffer)
            const completeBuffer = Buffer.concat(rawLogBuffer)
            const decodedStream = decodeDockerStream(completeBuffer)
            console.log('Decoded Buffer', decodedStream)
            console.log('Decode dStream stdout', decodedStream.stdout)
        })
    })
    await cppDockerContainer.remove()
}

export default runCpp





