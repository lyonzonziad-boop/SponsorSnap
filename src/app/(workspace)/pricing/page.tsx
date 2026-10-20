"use client";

import { PricingPanel } from "@/components/pricing-panel";
import { PageHeader } from "@/components/shell";
import { useApp } from "@/context/app-context";

export default function PricingPage() {
  const { t } = useApp();
  return (
    <div>
      <PageHeader title={t.pricing.title} subtitle={t.pricing.intro} />
      <PricingPanel />
    </div>
  );
}
