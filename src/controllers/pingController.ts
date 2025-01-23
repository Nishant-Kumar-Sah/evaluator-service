import { Request, Response } from "express";

export const pingCheck = async (_: Request, res: Response):Promise<any> => {

    try{
        return res.status(200).json({
            message: "Ping check ok"
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Ping check failed"
        });
    }

};