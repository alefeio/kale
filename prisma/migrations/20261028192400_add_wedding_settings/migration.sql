-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('PHONE', 'EMAIL', 'CPF', 'CNPJ', 'EVP');

-- CreateTable
CREATE TABLE "WeddingSettings" (
    "id" TEXT NOT NULL,
    "pixEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pixKeyType" "PixKeyType",
    "pixKey" TEXT,
    "pixReceiver" TEXT,
    "pixCity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingSettings_pkey" PRIMARY KEY ("id")
);
