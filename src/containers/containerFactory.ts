import Docker from 'dockerode'

async function createContainer(imageName: string, cmdExecutable: string[]) {
    const docker = new Docker();
    
    const container = await docker.createContainer({
        Image: imageName,
        Cmd: cmdExecutable,
        AttachStdin: true, // input streams 
        AttachStdout: true, // output streams
        AttachStderr: true, // error streams
        Tty: false,
        OpenStdin: true,
        HostConfig: {
            Memory: 1024 * 1024 * 1024, // 1 GB allowed
        }

    })

    return container;

}

export default createContainer;