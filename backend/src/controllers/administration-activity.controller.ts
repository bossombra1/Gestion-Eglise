import type {NextFunction,Request,Response} from 'express'
import {administrationActivityService} from '../services/administration-activity.service'
export const getActivity=async(req:Request,res:Response,next:NextFunction)=>{
 try{
  if(!req.user?.parishId)return res.status(403).json({success:false,message:'Aucune paroisse n’est associée à ce compte.'})
  const days=Number(req.query.days)||30
  const movementId=typeof req.query.movementId==='string'?req.query.movementId:undefined
  const data=await administrationActivityService.getActivity(req.user.parishId,movementId,days)
  return res.json({success:true,data})
 }catch(error){return next(error)}
}
