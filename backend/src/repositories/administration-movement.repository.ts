import { prisma } from '../lib/prisma'

export const administrationMovementRepository = {
  findMovements(parishId: string, search?: string, status?: string) {
    const q = search?.trim()
    return prisma.movement.findMany({
      where: {
        parishId,
        ...(q ? { OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ] } : {}),
        ...(status ? { status: status as any } : {}),
      },
      select: {
        id:true,name:true,code:true,description:true,status:true,createdAt:true,updatedAt:true,
        manager:{select:{id:true,firstName:true,lastName:true,email:true,phone:true,status:true}},
        _count:{select:{members:true,registrations:true}},
      },
      orderBy:{name:'asc'},
    })
  },
}
