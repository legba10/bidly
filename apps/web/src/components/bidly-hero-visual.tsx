export function BidlyHeroVisual() {
  return (
    <div aria-hidden="true" className="bidly-hero-visual">
      <picture>
        <source
          media="(max-width: 47.99rem)"
          srcSet="/media/bidly-hero-road-1024.webp"
          type="image/webp"
        />
        <source
          media="(max-width: 95.99rem)"
          srcSet="/media/bidly-hero-road-1536.webp"
          type="image/webp"
        />
        <source srcSet="/media/bidly-hero-road-2560.webp" type="image/webp" />
        {/* The shared scene is decorative; adjacent HTML contains the complete product message. */}
        <img
          alt=""
          decoding="sync"
          fetchPriority="high"
          height="2160"
          src="/media/bidly-hero-road-4k.webp"
          width="3840"
        />
      </picture>
      <span className="bidly-hero-visual__readability" />
    </div>
  );
}
