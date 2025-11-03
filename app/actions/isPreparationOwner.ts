'use server'

import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function isPreparationOwner(preparationId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
// console.log(user.id);
  const preparation = await prisma.preparations.findUnique({
    where: {
      id: preparationId,
      userId: user?.id,
    },
  })
  if (preparation == null) return { isOwner: false }

  const isOwner = user?.id === preparation.userId
  return { isOwner }
}
