import { prisma } from "@/lib/prisma";
import STRAFENKATALOG from "@/lib/strafenkatalog";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { driverId, cause, penalty, event = "race" } = await req.json();

  const predefined = STRAFENKATALOG.find(c => c.cause === cause);

  const result = await prisma.penalty.create({
    data: {
      driverId,
      cause,
      penalty: predefined ? predefined.penalty[event] : penalty,
      event,
      discretionary: !predefined,
    },
  });

  return NextResponse.json(result);
}

export async function GET() {
  const penalties = await prisma.penalty.findMany({
    include: { driver: { include: { team: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(penalties);
}
