
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // If hitting the root on subdomains, send to the right page
  if (url.pathname === '/' || url.pathname === '') {
    if (host.startsWith('play.')) {
      url.pathname = '/join';
      return NextResponse.rewrite(url);
    }
    if (host.startsWith('score.')) {
      url.pathname = '/scoreboard';
      return NextResponse.rewrite(url);
    }
    if (host.startsWith('host.')) {
      url.pathname = '/host';
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}
