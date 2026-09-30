import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL n’est pas configurée.')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Création des données de démonstration...')
  console.log('')

  const passwordHash = await bcrypt.hash('Demo1234!', 12)

  // ─────────────────────────────────────────────
  // 1. PAROISSE
  // ─────────────────────────────────────────────

  const parish = await prisma.parish.upsert({
    where: {
      code: 'SAINT JOSEPH (RIVIERA BONOUMIN)',
    },
    update: {
      name: 'Paroisse Saint Joseph',
      address: 'Abidjan, Côte d’Ivoire',
      phone: '+225 07 00 00 00 00',
      email: 'contact@paroisse-demo.ci',
      description: 'Paroisse de démonstration EcclesiaConnect',
      active: true,
    },
    create: {
      name: 'Paroisse Saint Joseph',
      code: 'SAINT JOSEPH (RIVIERA BONOUMIN)',
      address: 'Abidjan, Côte d’Ivoire',
      phone: '+225 07 00 00 00 00',
      email: 'contact@paroisse-demo.ci',
      description: 'Paroisse de démonstration EcclesiaConnect',
      active: true,
    },
  })

  console.log(`✅ Paroisse : ${parish.name}`)

  // ─────────────────────────────────────────────
  // 2. RESPONSABLE DU MOUVEMENT
  // ─────────────────────────────────────────────

  const manager = await prisma.user.upsert({
    where: {
      email: 'responsable@ecclesiaconnect.ci',
    },
    update: {
      firstName: 'Jean',
      lastName: 'Kouassi',
      phone: '+225 07 11 11 11 11',
      passwordHash,
      role: 'MOVEMENT_MANAGER',
      status: 'ACTIVE',
      parishId: parish.id,
    },
    create: {
      firstName: 'Jean',
      lastName: 'Kouassi',
      email: 'responsable@ecclesiaconnect.ci',
      phone: '+225 07 11 11 11 11',
      passwordHash,
      role: 'MOVEMENT_MANAGER',
      status: 'ACTIVE',
      parishId: parish.id,
    },
  })

  console.log(`✅ Responsable : ${manager.firstName} ${manager.lastName}`)

  // ─────────────────────────────────────────────
  // 2 BIS. ADMINISTRATEUR DE PAROISSE
  // ─────────────────────────────────────────────

  const adminParish = await prisma.user.upsert({
    where: {
      email: 'admin@ecclesiaconnect.ci',
    },
    update: {
      firstName: 'Administrateur',
      lastName: 'Paroisse',
      phone: '+225 07 66 66 66 66',
      passwordHash,
      role: 'ADMIN_PARISH',
      status: 'ACTIVE',
      parishId: parish.id,
    },
    create: {
      firstName: 'Administrateur',
      lastName: 'Paroisse',
      email: 'admin@ecclesiaconnect.ci',
      phone: '+225 07 66 66 66 66',
      passwordHash,
      role: 'ADMIN_PARISH',
      status: 'ACTIVE',
      parishId: parish.id,
    },
  })

  console.log(`✅ Administrateur paroisse : ${adminParish.firstName} ${adminParish.lastName}`)

  // ─────────────────────────────────────────────
  // 3. MOUVEMENT
  // ─────────────────────────────────────────────

  const movement = await prisma.movement.upsert({
    where: {
      parishId_code: {
        parishId: parish.id,
        code: 'JEUNES-SJ',
      },
    },
    update: {
      name: 'SCOUT',
      description:
        'Mouvement de jeunesse de la Paroisse Saint Joseph.',
      status: 'ACTIVE',
      managerId: manager.id,
    },
    create: {
      name: 'SCOUT',
      code: 'JEUNES-SJ',
      description:
        'Mouvement de jeunesse de la Paroisse Saint Joseph.',
      status: 'ACTIVE',
      parishId: parish.id,
      managerId: manager.id,
    },
  })

  console.log(`✅ Mouvement : ${movement.name}`)

  // ─────────────────────────────────────────────
  // 4. MEMBRES DU MOUVEMENT
  // ─────────────────────────────────────────────

  const member1 = await prisma.user.upsert({
    where: {
      email: 'membre1@ecclesiaconnect.ci',
    },
    update: {
      firstName: 'Paul',
      lastName: 'Yao',
      phone: '+225 07 22 22 22 22',
      passwordHash,
      role: 'FAITHFUL',
      status: 'ACTIVE',
      parishId: parish.id,
    },
    create: {
      firstName: 'Paul',
      lastName: 'Yao',
      email: 'membre1@ecclesiaconnect.ci',
      phone: '+225 07 22 22 22 22',
      passwordHash,
      role: 'FAITHFUL',
      status: 'ACTIVE',
      parishId: parish.id,
    },
  })

  const member2 = await prisma.user.upsert({
    where: {
      email: 'membre2@ecclesiaconnect.ci',
    },
    update: {
      firstName: 'Marie',
      lastName: 'Koffi',
      phone: '+225 07 33 33 33 33',
      passwordHash,
      role: 'FAITHFUL',
      status: 'ACTIVE',
      parishId: parish.id,
    },
    create: {
      firstName: 'Marie',
      lastName: 'Koffi',
      email: 'membre2@ecclesiaconnect.ci',
      phone: '+225 07 33 33 33 33',
      passwordHash,
      role: 'FAITHFUL',
      status: 'ACTIVE',
      parishId: parish.id,
    },
  })

  const memberUsers = [manager, member1, member2]

  for (const member of memberUsers) {
    await prisma.movementMember.upsert({
      where: {
        movementId_userId: {
          movementId: movement.id,
          userId: member.id,
        },
      },
      update: {
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
      create: {
        movementId: movement.id,
        userId: member.id,
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    })
  }

  console.log('✅ Membres du mouvement créés')

  // ─────────────────────────────────────────────
  // 5. PARENTS
  // ─────────────────────────────────────────────

  const parent1 = await prisma.user.upsert({
    where: {
      email: 'parent1@ecclesiaconnect.ci',
    },
    update: {
      firstName: 'Pierre',
      lastName: 'Kouamé',
      phone: '+225 07 44 44 44 44',
      passwordHash,
      role: 'PARENT',
      status: 'ACTIVE',
      parishId: parish.id,
    },
    create: {
      firstName: 'Pierre',
      lastName: 'Kouamé',
      email: 'parent1@ecclesiaconnect.ci',
      phone: '+225 07 44 44 44 44',
      passwordHash,
      role: 'PARENT',
      status: 'ACTIVE',
      parishId: parish.id,
    },
  })

  const parent2 = await prisma.user.upsert({
    where: {
      email: 'parent2@ecclesiaconnect.ci',
    },
    update: {
      firstName: 'Anne',
      lastName: 'N’Guessan',
      phone: '+225 07 55 55 55 55',
      passwordHash,
      role: 'PARENT',
      status: 'ACTIVE',
      parishId: parish.id,
    },
    create: {
      firstName: 'Anne',
      lastName: 'N’Guessan',
      email: 'parent2@ecclesiaconnect.ci',
      phone: '+225 07 55 55 55 55',
      passwordHash,
      role: 'PARENT',
      status: 'ACTIVE',
      parishId: parish.id,
    },
  })

  console.log('✅ Parents créés')

  // ─────────────────────────────────────────────
  // 6. ENFANTS
  // ─────────────────────────────────────────────

  const child1 = await prisma.child.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000101',
    },
    update: {
      firstName: 'David',
      lastName: 'Kouamé',
      birthDate: new Date('2014-05-12'),
      gender: 'M',
      medicalInformation: 'Aucune information particulière.',
      emergencyContactName: 'Pierre Kouamé',
      emergencyContactPhone: '+225 07 44 44 44 44',
      parishId: parish.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      firstName: 'David',
      lastName: 'Kouamé',
      birthDate: new Date('2014-05-12'),
      gender: 'M',
      medicalInformation: 'Aucune information particulière.',
      emergencyContactName: 'Pierre Kouamé',
      emergencyContactPhone: '+225 07 44 44 44 44',
      parishId: parish.id,
    },
  })

  const child2 = await prisma.child.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000102',
    },
    update: {
      firstName: 'Esther',
      lastName: 'N’Guessan',
      birthDate: new Date('2013-09-20'),
      gender: 'F',
      medicalInformation: 'Allergie légère aux arachides.',
      emergencyContactName: 'Anne N’Guessan',
      emergencyContactPhone: '+225 07 55 55 55 55',
      parishId: parish.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000102',
      firstName: 'Esther',
      lastName: 'N’Guessan',
      birthDate: new Date('2013-09-20'),
      gender: 'F',
      medicalInformation: 'Allergie légère aux arachides.',
      emergencyContactName: 'Anne N’Guessan',
      emergencyContactPhone: '+225 07 55 55 55 55',
      parishId: parish.id,
    },
  })

  const child3 = await prisma.child.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000103',
    },
    update: {
      firstName: 'Samuel',
      lastName: 'Kouadio',
      birthDate: new Date('2015-02-08'),
      gender: 'M',
      medicalInformation: 'Aucune information particulière.',
      emergencyContactName: 'Pierre Kouamé',
      emergencyContactPhone: '+225 07 44 44 44 44',
      parishId: parish.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000103',
      firstName: 'Samuel',
      lastName: 'Kouadio',
      birthDate: new Date('2015-02-08'),
      gender: 'M',
      medicalInformation: 'Aucune information particulière.',
      emergencyContactName: 'Pierre Kouamé',
      emergencyContactPhone: '+225 07 44 44 44 44',
      parishId: parish.id,
    },
  })

  console.log('✅ 3 enfants créés')

  // ─────────────────────────────────────────────
  // 7. LIENS PARENT → ENFANT
  // ─────────────────────────────────────────────

  await prisma.parentChild.createMany({
    data: [
      {
        parentId: parent1.id,
        childId: child1.id,
        relationship: 'Père',
        isPrimary: true,
      },
      {
        parentId: parent2.id,
        childId: child2.id,
        relationship: 'Mère',
        isPrimary: true,
      },
      {
        parentId: parent1.id,
        childId: child3.id,
        relationship: 'Père',
        isPrimary: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Liens parents/enfants créés')

  // ─────────────────────────────────────────────
  // 8. INSCRIPTIONS
  // ─────────────────────────────────────────────

  const registration1 = await prisma.registration.upsert({
    where: {
      childId_movementId: {
        childId: child1.id,
        movementId: movement.id,
      },
    },
    update: {
      parishId: parish.id,
      status: 'APPROVED',
      approvedAt: new Date(),
      createdById: manager.id,
      notes: 'Inscription de démonstration',
    },
    create: {
      childId: child1.id,
      movementId: movement.id,
      parishId: parish.id,
      status: 'APPROVED',
      approvedAt: new Date(),
      createdById: manager.id,
      notes: 'Inscription de démonstration',
    },
  })

  const registration2 = await prisma.registration.upsert({
    where: {
      childId_movementId: {
        childId: child2.id,
        movementId: movement.id,
      },
    },
    update: {
      parishId: parish.id,
      status: 'APPROVED',
      approvedAt: new Date(),
      createdById: manager.id,
      notes: 'Inscription de démonstration',
    },
    create: {
      childId: child2.id,
      movementId: movement.id,
      parishId: parish.id,
      status: 'APPROVED',
      approvedAt: new Date(),
      createdById: manager.id,
      notes: 'Inscription de démonstration',
    },
  })

  const registration3 = await prisma.registration.upsert({
    where: {
      childId_movementId: {
        childId: child3.id,
        movementId: movement.id,
      },
    },
    update: {
      parishId: parish.id,
      status: 'PENDING',
      approvedAt: null,
      createdById: manager.id,
      notes: 'Inscription en attente de validation',
    },
    create: {
      childId: child3.id,
      movementId: movement.id,
      parishId: parish.id,
      status: 'PENDING',
      createdById: manager.id,
      notes: 'Inscription en attente de validation',
    },
  })

  console.log('✅ 3 inscriptions créées')

  // ─────────────────────────────────────────────
  // 9. COTISATIONS
  // ─────────────────────────────────────────────

  const annualFee = await prisma.movementFee.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000001',
    },
    update: {
      name: 'Cotisation annuelle 2026',
      amount: 15000,
      currency: 'XOF',
      active: true,
      movementId: movement.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      movementId: movement.id,
      name: 'Cotisation annuelle 2026',
      amount: 15000,
      currency: 'XOF',
      active: true,
    },
  })

  const activityFee = await prisma.movementFee.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000002',
    },
    update: {
      name: 'Participation activités',
      amount: 5000,
      currency: 'XOF',
      active: true,
      movementId: movement.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      movementId: movement.id,
      name: 'Participation activités',
      amount: 5000,
      currency: 'XOF',
      active: true,
    },
  })

  console.log('✅ 2 cotisations créées')

  // ─────────────────────────────────────────────
  // 10. PAIEMENTS DE DÉMONSTRATION
  // ─────────────────────────────────────────────

  await prisma.payment.deleteMany({
    where: {
      transactionReference: {
        in: ['DEMO-PAYMENT-001', 'DEMO-PAYMENT-002'],
      },
    },
  })

  await prisma.payment.create({
    data: {
      amount: 15000,
      currency: 'XOF',
      method: 'ORANGE_MONEY',
      status: 'SUCCESS',
      transactionReference: 'DEMO-PAYMENT-001',
      registrationId: registration1.id,
      feeId: annualFee.id,
      parishId: parish.id,
      createdById: manager.id,
      paidAt: new Date(),
    },
  })

  await prisma.payment.create({
    data: {
      amount: 5000,
      currency: 'XOF',
      method: 'WAVE',
      status: 'SUCCESS',
      transactionReference: 'DEMO-PAYMENT-002',
      registrationId: registration2.id,
      feeId: activityFee.id,
      parishId: parish.id,
      createdById: manager.id,
      paidAt: new Date(),
    },
  })

  console.log('✅ 2 paiements créés')

  // ─────────────────────────────────────────────
  // RÉCAPITULATIF
  // ─────────────────────────────────────────────

  console.log('')
  console.log('══════════════════════════════════════════════════')
  console.log('🎉 DONNÉES DE DÉMONSTRATION CRÉÉES AVEC SUCCÈS')
  console.log('══════════════════════════════════════════════════')
  console.log('')

  console.log('👤 COMPTE RESPONSABLE MOUVEMENT')
  console.log('   Nom         : Jean Kouassi')
  console.log('   Email       : responsable@ecclesiaconnect.ci')
  console.log('   Mot de passe: Demo1234!')
  console.log('   Rôle        : MOVEMENT_MANAGER')
  console.log('')

  console.log('⛪ PAROISSE')
  console.log('   Paroisse Saint Joseph')
  console.log('   Code : SAINT JOSEPH (RIVIERA BONOUMIN)')
  console.log('')

  console.log('🧑‍🤝‍🧑 MOUVEMENT')
  console.log('   SCOUT')
  console.log('   Code : JEUNES-SJ')
  console.log('')

  console.log('👥 MEMBRES')
  console.log('   3 membres du mouvement')
  console.log('')

  console.log('👨‍👩‍👧 ENFANTS')
  console.log('   3 enfants')
  console.log('')

  console.log('📝 INSCRIPTIONS')
  console.log('   2 approuvées')
  console.log('   1 en attente')
  console.log('')

  console.log('💰 COTISATIONS')
  console.log('   2 cotisations')
  console.log('')

  console.log('💳 PAIEMENTS')
  console.log('   15 000 XOF — Orange Money')
  console.log('   5 000 XOF — Wave')
  console.log('')

  console.log('══════════════════════════════════════════════════')
  console.log('🚀 Tu peux maintenant te connecter à EcclesiaConnect.')
  console.log('══════════════════════════════════════════════════')
}

main()
  .catch((error) => {
    console.error('')
    console.error('❌ Erreur pendant le seed :')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })