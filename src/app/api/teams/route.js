export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { name } = await req.json();
  const team = await prisma.team.create({ data: { name } });
  return NextResponse.json(team);
}

export async function GET() {
  const teams = await prisma.team.findMany({
    include: {
      drivers: true,
    },
  });
  return NextResponse.json(teams);
}
