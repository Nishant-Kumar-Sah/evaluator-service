import { Schema, ZodSchema } from "zod";
import { Request,Response, NextFunction } from "express";
export const validate = (schema:ZodSchema<any>)=>async(req: Request, res:Response, next: NextFunction):Promise<any>=>{
    try{
        schema.parse({
            ...req.body
        });
        next();
    }catch(err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: 'Invalid request params recieved',
            data:{},
            error:err
        });
    }
    
}