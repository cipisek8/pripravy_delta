'use server'

import prisma from '@/lib/prisma'

interface Filters {
  year?: string
  fieldId?: string
  theme?: string
}

export async function getReviewingPreparations(filters: Filters = {}) {
  const where: any = { reviewing: true }

  if (filters.year) where.year = filters.year
  if (filters.fieldId) where.fieldId = { startsWith: filters.fieldId }
  if (filters.theme) where.theme = { contains: filters.theme, mode: 'insensitive' }
  const preparations = await prisma.preparations.findMany({
    where,
    orderBy: { createdat: 'desc' },
  });

  return preparations;
}