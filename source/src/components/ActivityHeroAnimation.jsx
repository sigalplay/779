// Animated main pictures for a few craft activities, built from separate illustration layers.
// People who ask their device for less motion see the still picture instead (see activity-hero-animation.css).
const BASE = "/icon-bank/crafts-new";

const ANIMATIONS = {
  // The butterfly turns on its thread inside the frame: the color side, then the white side.
  "seed-121": ({ alt }) => (
    <div className="hero-anim hero-anim-floating" role="img" aria-label={alt}>
      <img className="hero-anim-layer" src={`${BASE}/floating-butterfly/anim-frame.webp`} alt="" />
      <div className="hero-anim-float-spin">
        <img className="hero-anim-float-front" src={`${BASE}/floating-butterfly/anim-butterfly.webp`} alt="" />
        <img className="hero-anim-float-back" src={`${BASE}/floating-butterfly/anim-butterfly.webp`} alt="" />
      </div>
    </div>
  ),
  // The butterfly takes off from the straw, flaps its wings, and comes round again.
  "seed-122": ({ alt }) => (
    <div className="hero-anim hero-anim-flying" role="img" aria-label={alt}>
      <img className="hero-anim-layer" src={`${BASE}/flying-butterfly/anim-base.webp`} alt="" />
      <div className="hero-anim-fly-path">
        <img className="hero-anim-fly-wings" src={`${BASE}/flying-butterfly/anim-butterfly.webp`} alt="" />
      </div>
    </div>
  ),
};

export function hasHeroAnimation(activityId) {
  return Boolean(ANIMATIONS[activityId]);
}

export function ActivityHeroAnimation({ activityId, alt }) {
  const Animation = ANIMATIONS[activityId];
  return Animation ? <Animation alt={alt} /> : null;
}
