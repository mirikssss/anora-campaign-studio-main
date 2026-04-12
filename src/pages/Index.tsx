import { useCampaignStore } from '@/store/campaignStore';
import RoleSelection from '@/pages/RoleSelection';
import AdvertiserOnboarding from '@/pages/AdvertiserOnboarding';
import Dashboard from '@/pages/Dashboard';
import CampaignFlow from '@/pages/CampaignFlow';
import AnalysisScreen from '@/pages/AnalysisScreen';
import PublisherOnboarding from '@/pages/PublisherOnboarding';
import PublisherSimulator from '@/pages/PublisherSimulator';

export default function Index() {
  const { screen } = useCampaignStore();

  switch (screen) {
    case 'onboarding':
      return <AdvertiserOnboarding />;
    case 'publisherOnboarding':
      return <PublisherOnboarding />;
    case 'dashboard':
      return <Dashboard />;
    case 'campaign':
      return <CampaignFlow />;
    case 'analysis':
      return <AnalysisScreen />;
    case 'simulator':
      return <PublisherSimulator />;
    default:
      return <RoleSelection />;
  }
}
