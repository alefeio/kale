import { Suspense } from "react"
import { InvitationExperience } from "@/components/invitation/InvitationExperience"
import { InvitationSkeleton } from "@/components/invitation/InvitationSkeleton"
import { invitationSeeds } from "@/data/invitations.mock"

export function generateStaticParams() {
  return invitationSeeds.map((invitation) => ({ token: invitation.token }))
}

export default function Page({ params }: PageProps<"/convite/[token]">) {
  return (
    <main id="conteudo">
      <Suspense fallback={<InvitationSkeleton />}>
        <InvitationGate params={params} />
      </Suspense>
    </main>
  )
}

async function InvitationGate({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <InvitationExperience token={decodeURIComponent(token)} />
}
