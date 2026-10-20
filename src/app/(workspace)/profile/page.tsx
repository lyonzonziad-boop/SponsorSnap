"use client";

import { NeedProject, ProfileForm } from "@/components/forms";
import { PageHeader } from "@/components/shell";
import { useApp } from "@/context/app-context";

export default function ProfilePage() {
  const { t, active, updateActive, notify } = useApp();
  if (!active) return <NeedProject t={t} />;
  return (
    <div>
      <PageHeader title={t.profile.title} />
      <div className="ss-card p-5">
        <ProfileForm
          profile={active.profile}
          t={t}
          notify={notify}
          onChange={(profile) =>
            updateActive((p) => ({
              ...p,
              profile,
              appearance: {
                ...p.appearance,
                accentColor: profile.brandColor,
                secondaryColor: profile.secondaryColor,
                fontFamily: profile.fontFamily,
              },
            }))
          }
        />
      </div>
    </div>
  );
}
