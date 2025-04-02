import evaluationQueue from "../queues/evalutationQueue";

export default async function( payload: Record<string, unknown>){
    await evaluationQueue.add("EvaluationJob", payload);
    console.log("Sucessfully added a new Evaluation job")
    
}