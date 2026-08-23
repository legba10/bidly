import { BidlyHeroVisual } from '../bidly-hero-visual';

import { HeroCopy } from './hero-copy';

export function HomeHero() {
  return (
    <section className="bidly-home-hero-region">
      <div className="bidly-home-hero">
        <BidlyHeroVisual />
        <HeroCopy />
      </div>
    </section>
  );
}
