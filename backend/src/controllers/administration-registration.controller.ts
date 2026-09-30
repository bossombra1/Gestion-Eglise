import type {NextFunction,Request,Response} from 'express'
import {administrationRegistrationService} from '../services/administration-registration.service'
export const getRegistrations=async(req:Request,res:Response,next:NextFunction)=>{
 try{if(!req.user?.parishId)return res.status(403).json({success:false,message:'Aucune paroisse n’est associée à ce compte.'})
 const movementId=typeof req.query.movementId==='string'?req.query.movementId:undefined
 const status=typeof req.query.status==='string'&&req.query.status?req.query.status:undefined
 const days=Number(req.query.days)||30
 return res.json({success:true,data:await administrationRegistrationService.list(req.user.parishId,movementId,status,days)})
 }catch(error){return next(error)}
}
