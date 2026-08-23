import { BusinessDashboard } from '../../components/business-dashboard';
import { BusinessShell } from '../../components/business-shell';
import { UnavailableRoutePage } from '../../components/unavailable-route-page';
import { isBidlyDemoMode } from '../../demo/marketplace-demo';

export default function BusinessPage() {
  if (!isBidlyDemoMode()) return <UnavailableRoutePage area="business" businessFrame />;
  return (
    <BusinessShell active="business">
      <BusinessDashboard section="business" />
    </BusinessShell>
  );
}
