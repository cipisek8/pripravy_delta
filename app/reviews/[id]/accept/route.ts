import { NextRequest, NextResponse } from 'next/server'
import { changeReview } from '@/app/actions/changeReview'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	await changeReview(id, true)

	const url = req.nextUrl.clone()
	url.pathname = '/preparations'
	return NextResponse.redirect(url, 302)
}

