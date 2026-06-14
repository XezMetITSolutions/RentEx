import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StaffPanel from "./StaffPanel";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect("/admin/login");
        return null;
    }

    // Load initial staff and locations
    const staff = await prisma.staff.findMany({
        include: { location: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
    });

    const locations = await prisma.location.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    // Remove password hashes from staff objects
    const safeStaff = staff.map(({ passwordHash, ...s }) => s);

    return (
        <StaffPanel
            currentStaff={session}
            initialStaff={safeStaff as any}
            locations={locations}
        />
    );
}

