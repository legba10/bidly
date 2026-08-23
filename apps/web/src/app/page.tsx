import { BusinessSection } from '../components/home/business-section';
import { CategoryRail } from '../components/home/category-rail';
import { HomeHero } from '../components/home/home-hero';
import { HowItWorks } from '../components/home/how-it-works';
import { PublicFooter, PublicHeader } from '../components/public-navigation';
import { ruRU } from '../i18n/messages/ru-RU';

export default function LandingPage() {
  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader tone="dark" />
      <main className="bidly-home" id="main-content">
        <HomeHero />
        <CategoryRail />
        <HowItWorks />
        <BusinessSection />
      </main>
      <PublicFooter tone="dark" />
    </>
  );
}
