import Docker from 'dockerode'

import createContainer from './containerFactory'
// import {  TestCases } from '../types/testCases'
import { PYTHON_IMAGE } from '../utils/constants'
import pullImage from './pullImage';
import { decodeDockerStream } from './dockerHelper';

async function runPython(code: string, inputTestCase: string){
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
    loggerStream.on('end',() =>{
        console.log("Raw Log buffer" ,rawLogBuffer)
        const completeBuffer = Buffer.concat(rawLogBuffer)
        const decodedStream = decodeDockerStream(completeBuffer)
        console.log('Decoded Buffer' , decodedStream)
        console.log('Decode stream stdout', decodedStream.stdout)
         
    })

    return pythonDockerContainer
}

export default runPython