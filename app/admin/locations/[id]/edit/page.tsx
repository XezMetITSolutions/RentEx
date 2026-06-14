import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import EditLocationClient from "./EditLocationClient";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) {
        redirect("/admin/login");
        return null;
    }

    if (session.role !== "ADMINISTRATOR") {
        redirect("/admin");
        return null;
    }

    const { id } = await params;

    return <EditLocationClient idParam={id} />;
}
