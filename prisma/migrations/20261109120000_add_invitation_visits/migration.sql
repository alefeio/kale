-- Invitation visit events for Admin organization (openings, not unique people).
-- No IP / geo / fingerprint / user-agent columns by design.

CREATE TABLE "InvitationVisit" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventKey" TEXT NOT NULL,
    CONSTRAINT "InvitationVisit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InvitationVisit_eventKey_key" ON "InvitationVisit"("eventKey");
CREATE INDEX "InvitationVisit_invitationId_visitedAt_idx" ON "InvitationVisit"("invitationId", "visitedAt");

ALTER TABLE "InvitationVisit"
  ADD CONSTRAINT "InvitationVisit_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
