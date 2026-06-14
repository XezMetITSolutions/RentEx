import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import NewLocationClient from "./NewLocationClient";

export const dynamic = "force-dynamic";

export default async function NewLocationPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect("/admin/login");
        return null;
    }

    if (session.role !== "ADMINISTRATOR") {
        redirect("/admin");
        return null;
    }

    return <NewLocationClient />;
}
