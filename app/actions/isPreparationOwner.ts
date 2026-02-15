'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function isPreparationOwner(preparationId: string) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getClaims();

  const preparation = await prisma.preparations.findUnique({
    where: {
      id: preparationId,
      userId: data.claims.sub,
    },
  })
  if (preparation == null) return { isOwner: false }

  const isOwner = data.claims.sub === preparation.userId
  return { isOwner }
}
