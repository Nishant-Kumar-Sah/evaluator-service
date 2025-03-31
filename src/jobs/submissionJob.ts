import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefination";
import { SubmissionPayload } from "../types/submissionPayload";
import runCpp from "../containers/cppExecutor";
import createExecutor from "../utils/ExecutorFactory";
import { ExecutionResponse } from "../types/codeEexecutorStrategy";

export default class SubmissionJob implements IJob {
    name: string;
    payload: Record<string, SubmissionPayload>
    constructor(payload: Record<string, SubmissionPayload >){
        this.name = this.constructor.name,
        this.payload = payload
    }
    handle =async(job?: Job) => {
        console.log("Handler of the job called")
        console.log(this.payload)
        if(job) {
            const key = Object.keys(this.payload)[0];
            const inputTestCase = this.payload[key].inputCase
            console.log(inputTestCase)
            const outputTestCase = this.payload[key].outputCase
            const codeLanguage = this.payload[key].language
            const code = this.payload[key].code
            console.log(`Language : ${codeLanguage}`)
            
            const strategy = createExecutor(codeLanguage);
            if(strategy != null){
                const response: ExecutionResponse = await strategy.execute(code, inputTestCase,outputTestCase)
                if( response.status === "SUCCESS") {
                    console.log("Code executed successfully")
                    console.log(response)
                }else {
                    console.log("Something went wrong with code executed")
                    console.log(response)
                }
            }
        }
    }
    failed =(job? : Job): void => {
        console.log("Job failed")
        if(job){
            console.log(job.id)
        }
    }


} 