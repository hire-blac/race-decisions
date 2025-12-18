export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { name, teamId, carNumber } = await req.json();
  const driver = await prisma.driver.create({
    data: {
      name,
      teamId,
      carNumber: carNumber || null,
    },
  });
  return NextResponse.json(driver);
}

export async function GET() {
  const drivers = await prisma.driver.findMany({
    include: { team: true },
  });
  return NextResponse.json(drivers);
}
