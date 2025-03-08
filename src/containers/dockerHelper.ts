import DockerStreamOutput from "../types/dockerStreamOutput";
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constants";


//this function helps in decoding the buffer object
export function decodeDockerStream(buffer:Buffer):DockerStreamOutput{
    let offset = 0 ;  // helps to keep track of the current position in the buffer while parsing

    // the output that will store the accumulated stdout and stderr output as strings 
    const output: DockerStreamOutput = {
        stdout: '',
        stderr: '',
    }

    //loop until we reach end of the buffer 
    while(offset < buffer.length) {
        // channel is read from the buffer and has value as type of stream
        const typeOfStream = buffer[offset]


        //this length variable hold the length of the value
        //we will read this variable on an offset of 4 bytes from the start of the chunk
        const length = buffer.readUInt32BE(offset + 4 )

        //as we have now read the buffer we can now move forward to the value of the buffer
        offset += DOCKER_STREAM_HEADER_SIZE
        

        if(typeOfStream === 1) {
            //stdout stream
            output.stdout += buffer.toString('utf-8', offset, offset + length)

        }else if (typeOfStream === 2) {
            //stderr stream
            output.stderr += buffer.toString('utf-8', offset, offset + length)

        }


        offset += length 
    }
    return output;
}