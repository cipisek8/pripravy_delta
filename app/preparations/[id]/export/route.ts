import { NextRequest } from 'next/server'
import { exportToPdf } from '@/app/actions/exportToPdf'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return exportToPdf(params.id)
}
