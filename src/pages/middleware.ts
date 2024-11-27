import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Redirect requests to /pages/ to /api/
  if (url.pathname.startsWith('/app/pages/')) {
    url.pathname = url.pathname.replace('/app/pages/', '/api/');
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
