import { NextRequest } from 'next/server'
import { exportToPdf } from '@/app/actions/exportToPdf'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return exportToPdf(id)
}

