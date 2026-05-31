import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { cache } from "react";

export const getCachedServerSession = cache(() => getServerSession(authOptions));
