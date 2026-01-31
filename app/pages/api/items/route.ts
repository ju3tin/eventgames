import { NextResponse } from 'next/server';

export async function GET() {
  const items = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 25 },
    { id: 3, name: 'Keyboard', price: 60 },
  ];

  return NextResponse.json(items);
}
