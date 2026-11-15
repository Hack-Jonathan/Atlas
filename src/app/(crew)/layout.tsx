/**
 * Layout of the astronaut area (route group `(crew)`, not part of the URL):
 * left rail + mission strip + page content. Authentication arrives in a later stage.
 */
import type { ReactNode } from "react";

import { CrewRail } from "@/components/layout/crew-rail";
import { MissionStrip } from "@/components/layout/mission-strip";

export default function CrewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col md:flex-row">
      <CrewRail />
      <main id="main" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <MissionStrip />
        {/* shrink-0 keeps content from being squeezed; grow lets pages fill spare height. */}
        <div className="flex shrink-0 grow flex-col">{children}</div>
      </main>
    </div>
  );
}
