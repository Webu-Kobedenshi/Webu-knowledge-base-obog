import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

function loadEnvFiles(paths: string[]) {
  const initialEnvKeys = new Set(Object.keys(process.env));

  for (const path of paths) {
    const resolvedPath = resolve(path);
    if (!existsSync(resolvedPath)) {
      continue;
    }

    const lines = readFileSync(resolvedPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
      if (!match) {
        continue;
      }

      const [, key, rawValue = ""] = match;
      if (initialEnvKeys.has(key)) {
        continue;
      }

      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
}

function parseAdminEmails(value?: string): string[] {
  const emails =
    value
      ?.split(",")
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean) ?? [];

  return [...new Set(emails)];
}

async function main() {
  loadEnvFiles(["../.env", ".env"]);

  const adminEmails = parseAdminEmails(process.env.ADMIN_SEED_EMAILS);
  if (adminEmails.length === 0) {
    console.log("No admin emails configured. Set ADMIN_SEED_EMAILS to add administrators.");
    return;
  }

  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/webu_portal?schema=public";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const email of adminEmails) {
      await prisma.adminEmail.upsert({
        where: { email },
        create: { email },
        update: { email },
      });
    }

    console.log(`Admin email seed completed: ${adminEmails.length} admin emails ensured.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
