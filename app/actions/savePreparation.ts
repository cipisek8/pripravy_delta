'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePreparation(data: {
  id?: string
  year?: string
  fieldId?: string
  theme?: string
  goals?: string
  times?: { subtheme: string; time: number }[]
  totalTime?: number
  content?: string
  reviewing?: boolean
  teachingAids?: string
  name?: string
  RVPCodes?: string[]
  gradeId?: number
}) {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let totalTimeIn = 0;
  if (data.totalTime !== undefined || data.totalTime !== null || data.totalTime !== 0) {
    totalTimeIn = data.totalTime
  }
  else {
    if (data.times) {
      totalTimeIn = data.times.reduce((acc, curr) => acc + curr.time, 0)
    }
  }

  if (data.id) {
    await prisma.preparations.update({
      where: { id: data.id },
      data: {
        totalTime: totalTimeIn,
        ...data
      },
    })
  }
  else {
    await prisma.preparations.create({
      data: {
        userId: user.id,
        totalTime: totalTimeIn,
        ...data
      },
    })
  }

  revalidatePath('/preparations')

}
