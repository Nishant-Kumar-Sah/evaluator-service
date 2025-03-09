import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { decodeDockerStream } from "./dockerHelper";
import pullImage from "./pullImage";


async function runJava(code: string, inputTestCase: string){
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

    await new Promise ((resolve, reject) => {
        loggerStream.on('end', () => {
            console.log('Raw Log Buffer', rawLogBuffer)
            const completeBuffer = Buffer.concat(rawLogBuffer)
            const decodedStream = decodeDockerStream(completeBuffer)
            console.log('Decoded Buffer' , decodedStream)
            console.log('Decode stream stdout', decodedStream.stdout)
            resolve(decodeDockerStream)
        })
    })
    await javaDockerContainer.remove()
}

export default runJava;