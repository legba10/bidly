import { notFound } from 'next/navigation';

import { BusinessDashboard } from '../../../components/business-dashboard';
import { BusinessShell, businessNavigation } from '../../../components/business-shell';
import { UnavailableRoutePage } from '../../../components/unavailable-route-page';
import { isBidlyDemoMode } from '../../../demo/marketplace-demo';

export default async function BusinessSectionPage({
  params,
}: {
  readonly params: Promise<{ readonly section: readonly string[] }>;
}) {
  const values = (await params).section;
  if (values.length !== 1) notFound();
  const section = values[0] ?? '';
  const allowed = businessNavigation.map(([path]) => path.split('/').at(-1));
  if (!allowed.includes(section) || section === 'business') notFound();
  if (!isBidlyDemoMode()) return <UnavailableRoutePage area="business" businessFrame />;
  return (
    <BusinessShell active={section}>
      <BusinessDashboard section={section} />
    </BusinessShell>
  );
}
