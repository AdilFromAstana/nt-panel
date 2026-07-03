import { NextResponse } from "next/server";
import { products } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(products());
}
