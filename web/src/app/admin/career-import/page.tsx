import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CareerImportClient } from "./career-import-client";

export default async function CareerImportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.serviceToken || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return <CareerImportClient />;
}
