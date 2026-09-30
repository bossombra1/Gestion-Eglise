import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'
const router=Router()
router.use(authenticate,authorize('ADMIN_PARISH'),requireParish)
router.get('/finances',async(req,res,next)=>{try{const parishId=req.user!.parishId!
 const [payments,successful,pending]=await Promise.all([
  prisma.payment.count({where:{parishId}}),
  prisma.payment.aggregate({where:{parishId,status:'SUCCESS'},_sum:{amount:true},_count:{_all:true}}),
  prisma.payment.count({where:{parishId,status:'PENDING'}})])
 return res.json({success:true,data:{paymentsTotal:payments,successfulCount:successful._count._all,totalCollected:Number(successful._sum.amount??0),pendingCount:pending}})}catch(e){next(e)}})
router.get('/communications',async(req,res,next)=>{try{const parishId=req.user!.parishId!
 const items=await prisma.communication.findMany({where:{parishId},select:{id:true,title:true,content:true,type:true,status:true,sentAt:true,createdAt:true,movement:{select:{id:true,name:true}},sender:{select:{firstName:true,lastName:true}}},orderBy:{createdAt:'desc'}})
 return res.json({success:true,data:items})}catch(e){next(e)}})
router.get('/intentions',async(req,res,next)=>{try{const parishId=req.user!.parishId!
 const items=await prisma.massIntention.findMany({where:{parishId},select:{id:true,intention:true,beneficiaryName:true,requestedDate:true,timeSlot:true,amount:true,currency:true,status:true,createdAt:true,requester:{select:{firstName:true,lastName:true,phone:true}}},orderBy:{requestedDate:'asc'}})
 return res.json({success:true,data:items})}catch(e){next(e)}})
router.patch('/intentions/:id/status',async(req,res,next)=>{try{const parishId=req.user!.parishId!,id=typeof req.params.id==='string'?req.params.id:''
 const status=req.body?.status
 if(!['PENDING','CONFIRMED','CANCELLED','COMPLETED'].includes(status)) return res.status(400).json({success:false,message:'Statut invalide.'})
 const item=await prisma.massIntention.updateMany({where:{id,parishId},data:{status}})
 if(!item.count)return res.status(404).json({success:false,message:'Intention introuvable.'})
 return res.json({success:true})}catch(e){next(e)}})
router.get('/agenda',async(req,res,next)=>{try{const parishId=req.user!.parishId!
 const items=await prisma.massIntention.findMany({where:{parishId},select:{id:true,intention:true,beneficiaryName:true,requestedDate:true,timeSlot:true,status:true},orderBy:{requestedDate:'asc'}})
 return res.json({success:true,data:items})}catch(e){next(e)}})
router.get('/settings',async(req,res,next)=>{try{const parish=await prisma.parish.findFirst({where:{id:req.user!.parishId},select:{id:true,name:true,code:true,address:true,phone:true,email:true,description:true,active:true,createdAt:true,updatedAt:true}})
 if(!parish)return res.status(404).json({success:false,message:'Paroisse introuvable.'})
 return res.json({success:true,data:parish})}catch(e){next(e)}})
export default router
