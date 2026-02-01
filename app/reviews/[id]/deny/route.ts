import { NextRequest, NextResponse } from 'next/server'
import { changeReview } from '@/app/actions/changeReview'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
await changeReview((await params).id, false);
const url = req.nextUrl.clone();
url.pathname = `/preparations`;
return NextResponse.redirect(url, 302);
}