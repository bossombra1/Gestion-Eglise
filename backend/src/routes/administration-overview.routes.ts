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
router.post('/intentions/:id/cash',async(req,res,next)=>{try{
 const parishId=req.user!.parishId!,id=typeof req.params.id==='string'?req.params.id:''
 const item=await prisma.massIntention.findFirst({where:{id,parishId},select:{id:true,amount:true,currency:true,status:true}})
 if(!item)return res.status(404).json({success:false,message:'Intention introuvable.'})
 if(item.status!=='PENDING')return res.status(409).json({success:false,message:'Cette intention n’est plus en attente de validation.'})
 const amount=Number(req.body?.amount ?? item.amount ?? 0)
 if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,message:'Le montant encaissé doit être supérieur à zéro.'})
 const reference=String(req.body?.reference ?? '').trim()
 if(reference.length>150)return res.status(400).json({success:false,message:'La référence du bordereau est trop longue.'})
 const note=String(req.body?.note ?? '').trim()
 const transactionReference=reference || `MASS_INTENTION:${id}`
 const result=await prisma.$transaction(async(tx)=>{
   const existing=await tx.payment.findFirst({where:{parishId,transactionReference},select:{id:true}})
   if(existing)throw new Error('Ce bordereau a déjà été enregistré.')
   const payment=await tx.payment.create({data:{
     parishId,
     amount,
     currency:item.currency,
     method:'CASH',
     status:'SUCCESS',
     transactionReference,
     paidAt:new Date(),
     createdById:req.user!.id,
     metadata:{massIntentionId:id,source:'ADMINISTRATION_CASH_COUNTER',...(note ? {note} : {})},
   }})
   const updated=await tx.massIntention.updateMany({where:{id,parishId,status:'PENDING'},data:{status:'CONFIRMED'}})
   if(!updated.count)throw new Error('L’intention a déjà été traitée.')
   return payment
 })
 return res.status(201).json({success:true,data:{paymentId:result.id,intentionId:id}})
}catch(e){
 if(e instanceof Error && ['Ce bordereau a déjà été enregistré.','L’intention a déjà été traitée.'].includes(e.message))
   return res.status(409).json({success:false,message:e.message})
 next(e)
}})

router.patch('/intentions/:id/status',async(req,res,next)=>{try{const parishId=req.user!.parishId!,id=typeof req.params.id==='string'?req.params.id:''
 const status=req.body?.status
 if(!['PENDING','CONFIRMED','CANCELLED','COMPLETED'].includes(status)) return res.status(400).json({success:false,message:'Statut invalide.'})
 const item=await prisma.massIntention.updateMany({where:{id,parishId},data:{status}})
 if(!item.count)return res.status(404).json({success:false,message:'Intention introuvable.'})
 return res.json({success:true})}catch(e){next(e)}})
router.get('/agenda',async(req,res,next)=>{try{const parishId=req.user!.parishId!
 const items=await prisma.massIntention.findMany({where:{parishId},select:{id:true,intention:true,beneficiaryName:true,requestedDate:true,timeSlot:true,status:true},orderBy:{requestedDate:'asc'}})
 return res.json({success:true,data:items})}catch(e){next(e)}})
router.patch('/settings',async(req,res,next)=>{try{
 const parishId=req.user!.parishId!
 const {name,code,address,phone,email,description}=req.body ?? {}
 if(typeof name!=='string' || !name.trim()) return res.status(400).json({success:false,message:'Le nom de la paroisse est obligatoire.'})
 if(typeof code!=='string' || !code.trim()) return res.status(400).json({success:false,message:'Le code paroisse est obligatoire.'})
 if(email!=null && email!=='' && typeof email!=='string') return res.status(400).json({success:false,message:'Email invalide.'})
 const existing=await prisma.parish.findUnique({where:{id:parishId},select:{id:true}})
 if(!existing)return res.status(404).json({success:false,message:'Paroisse introuvable.'})
 const duplicate=await prisma.parish.findFirst({where:{code:code.trim(),NOT:{id:parishId}},select:{id:true}})
 if(duplicate)return res.status(409).json({success:false,message:'Ce code paroisse est déjà utilisé.'})
 const parish=await prisma.parish.update({where:{id:parishId},data:{
   name:name.trim(),
   code:code.trim(),
   address:typeof address==='string'&&address.trim()?address.trim():null,
   phone:typeof phone==='string'&&phone.trim()?phone.trim():null,
   email:typeof email==='string'&&email.trim()?email.trim():null,
   description:typeof description==='string'&&description.trim()?description.trim():null,
 },select:{id:true,name:true,code:true,address:true,phone:true,email:true,description:true,active:true,createdAt:true,updatedAt:true}})
 return res.json({success:true,data:parish})
}catch(e){next(e)}})

router.get('/settings',async(req,res,next)=>{try{const parish=await prisma.parish.findFirst({where:{id:req.user!.parishId},select:{id:true,name:true,code:true,address:true,phone:true,email:true,description:true,active:true,createdAt:true,updatedAt:true}})
 if(!parish)return res.status(404).json({success:false,message:'Paroisse introuvable.'})
 return res.json({success:true,data:parish})}catch(e){next(e)}})
export default router
