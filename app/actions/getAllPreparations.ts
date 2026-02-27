'use server'

import prisma from '@/lib/prisma'

interface Filters {
  gradeId?: string
  fieldId?: string
  name?: string
}

export async function getAllPreparations(filters: Filters = {}) {
  const where: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any

  if (filters.gradeId) where.gradeId = parseInt(filters.gradeId)
  if (filters.fieldId) where.fieldId = { startsWith: filters.fieldId }
  if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' }
  
  const preparations = await prisma.preparations.findMany({
    where,
    orderBy: { createdat: 'desc' },
  });

  return preparations;
}
