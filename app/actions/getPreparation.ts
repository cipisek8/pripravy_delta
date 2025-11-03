'use server'

import prisma from '@/lib/prisma'

export async function getPreparation(id: string) {
  return prisma.preparations.findUnique({ where: { id } })
}
