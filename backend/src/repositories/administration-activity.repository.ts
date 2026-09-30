import { prisma } from '../lib/prisma'

export const administrationActivityRepository = {
  async getActivity(parishId:string, movementId?:string, days=30) {
    const since = new Date(Date.now() - Math.min(Math.max(days,7),90)*86400000)
    const where = { parishId, ...(movementId ? { movementId } : {}) }
    const [registrations,payments,members] = await Promise.all([
      prisma.registration.findMany({
        where:{...where, registrationDate:{gte:since}},
        orderBy:{registrationDate:'desc'}, take:100,
        select:{id,status,registrationDate,movement:{select:{id,name,code}},child:{select:{firstName:true,lastName:true}}},
      }),
      prisma.payment.findMany({
        where:{parishId, createdAt:{gte:since}, ...(movementId ? { registration:{movementId} } : {})},
        orderBy:{createdAt:'desc'}, take:100,
        select:{id,amount,currency,status,method,createdAt,registration:{select:{movement:{select:{id,name,code}}}}},
      }),
      prisma.movementMember.count({where:{movement:{parishId,...(movementId?{id:movementId}:{})},status:'ACTIVE'}}),
    ])
    const registrationByDay = new Map<string,number>()
    for(const x of registrations){const key=x.registrationDate.toISOString().slice(0,10);registrationByDay.set(key,(registrationByDay.get(key)||0)+1)}
    const paymentAmount = payments.filter(p=>p.status==='SUCCESS').reduce((sum,p)=>sum+Number(p.amount),0)
    return {periodDays:Math.min(Math.max(days,7),90),activeMembers:members,registrationsCount:registrations.length,successfulPaymentsCount:payments.filter(p=>p.status==='SUCCESS').length,successfulPaymentsAmount:paymentAmount,currency:'XOF',registrationTrend:Array.from(registrationByDay,([date,count])=>({date,count})).sort((a,b)=>a.date.localeCompare(b.date)),recentRegistrations:registrations,recentPayments:payments}
  },
}
