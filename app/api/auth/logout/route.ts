import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Đăng xuất thành công!' });
  response.cookies.set('pms_token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
}
