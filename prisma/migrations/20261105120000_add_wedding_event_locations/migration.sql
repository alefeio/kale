-- CreateEnum
CREATE TYPE "EventLocationType" AS ENUM ('CEREMONY', 'DINNER', 'RECEPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStartMode" AS ENUM ('EXACT', 'AFTER_MAIN', 'UNSPECIFIED');

-- CreateTable
CREATE TABLE "WeddingEventLocation" (
    "id" TEXT NOT NULL,
    "weddingSettingsId" TEXT NOT NULL,
    "type" "EventLocationType" NOT NULL,
    "title" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueAddress" TEXT,
    "venueNeighborhood" TEXT,
    "venueCity" TEXT NOT NULL,
    "venueState" TEXT NOT NULL,
    "description" TEXT,
    "startMode" "EventStartMode" NOT NULL DEFAULT 'UNSPECIFIED',
    "startsAt" TIMESTAMP(3),
    "mapsUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingEventLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeddingEventLocation_weddingSettingsId_sortOrder_idx" ON "WeddingEventLocation"("weddingSettingsId", "sortOrder");

-- CreateIndex
CREATE INDEX "WeddingEventLocation_weddingSettingsId_active_idx" ON "WeddingEventLocation"("weddingSettingsId", "active");

-- AddForeignKey
ALTER TABLE "WeddingEventLocation" ADD CONSTRAINT "WeddingEventLocation_weddingSettingsId_fkey" FOREIGN KEY ("weddingSettingsId") REFERENCES "WeddingSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
