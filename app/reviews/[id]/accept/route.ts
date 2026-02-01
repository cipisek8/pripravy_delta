import { NextRequest, NextResponse } from 'next/server'
import { changeReview } from '@/app/actions/changeReview'
import { redirect } from 'next/navigation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
await changeReview((await params).id, true);
const url = req.nextUrl.clone();
url.pathname = `/preparations`;
return NextResponse.redirect(url, 302);
}

