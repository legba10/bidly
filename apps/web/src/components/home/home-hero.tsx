import { BidlyHeroVisual } from '../bidly-hero-visual';

import { HeroCopy } from './hero-copy';

export function HomeHero() {
  return (
    <section className="bidly-home-hero-region">
      <BidlyHeroVisual />
      <div className="bidly-home-hero">
        <HeroCopy />
      </div>
    </section>
  );
}
