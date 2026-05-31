CREATE TABLE "AdminEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminEmail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminEmail_email_key" ON "AdminEmail"("email");
