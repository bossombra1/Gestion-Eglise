import { prisma } from '../lib/prisma'

export const administrationUserRepository = {
  findUsers(parishId: string, search?: string, role?: string, status?: string) {
    const q = search?.trim()
    return prisma.user.findMany({
      where: {
        parishId,
        ...(q ? { OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
        ] } : {}),
        ...(role ? { role: role as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
      select: { id:true, firstName:true, lastName:true, email:true, phone:true, role:true, status:true, createdAt:true, updatedAt:true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })
  },
}
