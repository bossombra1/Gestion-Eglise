import { prisma } from '../lib/prisma'

export const administrationRegistrationRepository = {
  async list(parishId:string, movementId?:string, status?:string, days=30) {
    const safeDays=Math.min(Math.max(days,7),90)
    const since=new Date(Date.now()-safeDays*86400000)
    const where={parishId,...(movementId?{movementId}:{}),...(status?{status:status as never}:{}),registrationDate:{gte:since}}
    const [items,total,pending,approved,rejected,cancelled,completed]=await Promise.all([
      prisma.registration.findMany({where,orderBy:{registrationDate:'desc'},take:200,select:{id,status,registrationDate,approvedAt,rejectedAt,rejectionReason,notes,movement:{select:{id,name,code}},child:{select:{id,firstName,lastName,birthDate,parentLinks:{where:{isPrimary:true},take:1,select:{parent:{select:{firstName:true,lastName:true,phone:true}}}}}}}}}),
      prisma.registration.count({where:{parishId,...(movementId?{movementId}:{}),registrationDate:{gte:since}}}),
      prisma.registration.count({where:{...where,status:'PENDING'}}),
      prisma.registration.count({where:{...where,status:'APPROVED'}}),
      prisma.registration.count({where:{...where,status:'REJECTED'}}),
      prisma.registration.count({where:{...where,status:'CANCELLED'}}),
      prisma.registration.count({where:{...where,status:'COMPLETED'}}),
    ])
    return {periodDays:safeDays,total,pending,approved,rejected,cancelled,completed,items}
  },
}
