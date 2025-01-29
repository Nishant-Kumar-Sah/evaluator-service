import { Request, Response  } from 'express';
import { CreateSubmissionDto } from '../dtos/CreateSubmissionDto';

export const  addSubmission = async (req: Request, res: Response):Promise<any> => {
    const submissionDto = req.body as CreateSubmissionDto;
    try{
        return res.status(201).json({
            success:true,
            error:{},
            message: "Successfully collected the submission",
            data: submissionDto
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            error:err,
            message: "Failed to collect the submission"
        });
    }
}