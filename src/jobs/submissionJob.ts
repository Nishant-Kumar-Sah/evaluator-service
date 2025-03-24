import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefination";
import { SubmissionPayload } from "../types/submissionPayload";
import runCpp from "../containers/cppExecutor";

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
            const codeLanguage = this.payload[key].language
            console.log(`Language : ${codeLanguage}`)
            if(this.payload[key].language === "CPP"){
                const response = await CppExecutor(this.payload[key].code, this.payload[key].inputCase)
                console.log("Evaluated Response: ", response)
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