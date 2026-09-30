import type { NextFunction, Request, Response } from 'express'
import { administrationMovementService } from '../services/administration-movement.service'

export const listMovements = async (req:Request,res:Response,next:NextFunction) => {
  try {
    if (!req.user?.parishId) return res.status(403).json({success:false,message:'Aucune paroisse n’est associée à ce compte.'})
    const data=await administrationMovementService.listMovements(
      req.user.parishId,
      typeof req.query.search==='string'?req.query.search:undefined,
      typeof req.query.status==='string'?req.query.status:undefined,
    )
    return res.json({success:true,data})
  } catch(error){return next(error)}
}
