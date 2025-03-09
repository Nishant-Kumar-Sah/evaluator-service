import { Job,Worker } from "bullmq";


import SubmissionJob from "../jobs/submissionJob";
import redisConnection from "../config/redisConfig";

export default function SubmissionWorker(queueName: string){
    new Worker(
        queueName,
        async (job:Job)=>{
            console.log("Submission Job worker kicking")
            if(job.name === "SubmissionJob"){
                const submissioJobInstance = new SubmissionJob(job.data);
                submissioJobInstance.handle(job) 

                return true;
            }
        },{
            connection: redisConnection
        }
    )
}