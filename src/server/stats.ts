import "server-only";
import type { Member, Payment, Subscription, Plan } from "@prisma/client";
import { db } from "@/server/db";

export type DashboardStats = {
  newQuotes: number;
  activeMembers: number;
  monthRevenueCRC: number;
  publishedVideos: number;
  totalViews: number;
  recentPayments: (Payment & { member: Member; subscription: (Subscription & { plan: Plan }) | null })[];
  recentMembers: Member[];
};

export async function getDashboardStats(now: Date = new Date()): Promise<DashboardStats> {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [newQuotes, activeMembers, revenue, publishedVideos, views, recentPayments, recentMembers] = await Promise.all([
    db.quoteRequest.count({ where: { status: "NEW" } }),
    db.subscription.count({
      where: { status: { in: ["ACTIVE", "CANCELED"] }, currentPeriodEnd: { gt: now }, member: { status: "ACTIVE" } },
    }),
    db.payment.aggregate({ _sum: { amountCRC: true }, where: { status: "APPROVED", createdAt: { gte: monthStart } } }),
    db.video.count({ where: { status: "PUBLISHED" } }),
    db.video.aggregate({ _sum: { views: true } }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { member: true, subscription: { include: { plan: true } } },
    }),
    db.member.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return {
    newQuotes,
    activeMembers,
    monthRevenueCRC: revenue._sum.amountCRC ?? 0,
    publishedVideos,
    totalViews: views._sum.views ?? 0,
    recentPayments,
    recentMembers,
  };
}
