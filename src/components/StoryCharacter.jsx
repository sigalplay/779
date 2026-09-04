const CHARACTER_ASSETS = {
  girl: {
    body: "/icon-bank/social-stories/characters/girl-body.webp",
    head: "/icon-bank/social-stories/characters/girl-head.webp",
    label: "דמות בת",
  },
  boy: {
    body: "/icon-bank/social-stories/characters/boy-body.webp",
    head: "/icon-bank/social-stories/characters/boy-head.webp",
    label: "דמות בן",
  },
};

export function StoryCharacter({ photo, gender = "girl", size = 128, className = "" }) {
  const character = CHARACTER_ASSETS[gender] || CHARACTER_ASSETS.girl;
  return (
    <div
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size * 1.88 }}
      aria-label={photo ? `${character.label} עם תמונת הילד/ה` : character.label}
    >
      <div className="relative h-full w-full">
        <img
          src={character.body}
          alt=""
          className="absolute left-0 w-full object-contain"
          style={{ top: size * 0.36, height: size * 1.5 }}
        />
        <div
          className={`absolute inset-x-0 z-10 mx-auto ${photo ? "overflow-hidden rounded-[46%]" : ""}`}
          style={{ top: size * 0.05, width: size * 0.56, height: size * 0.56 }}
        >
          <img
            src={photo || character.head}
            alt={photo ? "תמונת הילד/ה" : ""}
            className={`h-full w-full ${photo ? "scale-105 object-cover object-top" : "object-contain"}`}
          />
        </div>
      </div>
    </div>
  );
}

const FACE_LAYOUTS = {
  "toilet-cover-girl": {
    child: { left: "35.8%", top: "5.8%", width: "25.5%", height: "28.0%", imageScale: 1.08, imageY: "50%" },
  },
  "toilet-1-girl": {
    child: { left: "39.0%", top: "14.7%", width: "22.5%", height: "25.5%", imageScale: 1.08, imageY: "50%" },
  },
  "kindergarten-arrival-girl": {
    child: { left: "27.0%", top: "37.2%", width: "16.0%", height: "19.5%", imageScale: 1.18, imageY: "48%" },
    mother: { left: "50.0%", top: "10.8%", width: "18.8%", height: "22.5%", imageScale: 1.17, imageY: "49%" },
  },
  "kindergarten-cover-girl": {
    child: { left: "40.2%", top: "25.8%", width: "19.0%", height: "23.0%", imageScale: 0.96, imageY: "52%" },
  },
  "kindergarten-arrival-boy": {
    child: { left: "27.1%", top: "37.5%", width: "16.0%", height: "19.5%", imageScale: 1.18, imageY: "48%" },
    mother: { left: "50.0%", top: "10.8%", width: "18.8%", height: "22.5%", imageScale: 1.17, imageY: "49%" },
  },
  "kindergarten-cover-boy": {
    child: { left: "40.2%", top: "25.8%", width: "19.0%", height: "23.0%", imageScale: 0.96, imageY: "52%" },
  },
};

function IntegratedFaces({ layout, photos }) {
  const placements = FACE_LAYOUTS[layout];
  if (!placements) return null;
  return Object.entries(placements).map(([role, style]) => {
    const photo = photos?.[role];
    if (!photo) return null;
    const { imageScale, imageY, ...placementStyle } = style;
    return (
      <div key={role} className="pointer-events-none absolute z-10" style={placementStyle} aria-label={role === "mother" ? "פני האמא שהועלו" : "פני הילדה שהועלו"}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            WebkitMaskImage: "radial-gradient(ellipse 49% 50% at 50% 47%, #000 0 80%, rgba(0,0,0,.94) 86%, rgba(0,0,0,.55) 93%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 49% 50% at 50% 47%, #000 0 80%, rgba(0,0,0,.94) 86%, rgba(0,0,0,.55) 93%, transparent 100%)",
          }}
        >
          <img
            src={photo}
            alt=""
            className="h-full w-full object-contain"
            style={{ transform: `scale(${imageScale})`, transformOrigin: `50% ${imageY}` }}
          />
        </div>
      </div>
    );
  });
}

const ILLUSTRATED_HEAD_MASKS = {
  "kindergarten-arrival-girl": {
    child: "radial-gradient(ellipse 8.6% 10.4% at 35.0% 46.9%, #000 0 82%, rgba(0,0,0,.92) 88%, transparent 100%)",
    mother: "radial-gradient(ellipse 10.0% 11.8% at 59.4% 21.8%, #000 0 82%, rgba(0,0,0,.92) 88%, transparent 100%)",
  },
  "kindergarten-arrival-boy": {
    child: "radial-gradient(ellipse 8.6% 10.4% at 35.1% 47.2%, #000 0 82%, rgba(0,0,0,.92) 88%, transparent 100%)",
    mother: "radial-gradient(ellipse 10.0% 11.8% at 59.4% 21.8%, #000 0 82%, rgba(0,0,0,.92) 88%, transparent 100%)",
  },
};

function MissingIllustratedHeads({ layout, photos, illustration }) {
  const masks = ILLUSTRATED_HEAD_MASKS[layout];
  if (!masks || !illustration) return null;
  return Object.entries(masks).map(([role, mask]) => {
    if (photos?.[role]) return null;
    return (
      <img
        key={role}
        src={illustration}
        alt=""
        className="pointer-events-none absolute inset-0 z-[9] h-full w-full object-contain"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      />
    );
  });
}

export function StoryScene({ photo, facePhotos, faceLayout, faceBase, gender = "girl", illustration, className = "", characterSize = 148, integrated = false }) {
  const hasIntegratedPhoto = !!faceLayout && !!faceBase && Object.values(facePhotos || {}).some(Boolean);
  return (
    <div className={`relative aspect-square overflow-hidden rounded-2xl bg-[#fffaf1] ${className}`}>
      {illustration ? (
        <img src={hasIntegratedPhoto ? faceBase : illustration} alt="" className="absolute inset-0 h-full w-full bg-white object-contain" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff8ea] via-[#eef5ef] to-[#f5eafa]" />
      )}
      {hasIntegratedPhoto && <MissingIllustratedHeads layout={faceLayout} photos={facePhotos} illustration={illustration} />}
      <IntegratedFaces layout={faceLayout} photos={facePhotos} />
      {!integrated ? (
        <StoryCharacter
          photo={photo}
          gender={gender}
          size={characterSize}
          className="absolute inset-x-0 bottom-1 z-10 mx-auto drop-shadow-md"
        />
      ) : null}
    </div>
  );
}

export function StoryBookPage({ page, index, total, photo, facePhotos, gender = "girl", wordless = false, className = "" }) {
  const firstPageFacePhotos = index === 0 ? facePhotos : {};
  return (
    <article className={`social-story-page aspect-[210/297] bg-white p-[3.5%] text-foreground ${className}`} dir="rtl">
      <div className="flex h-full flex-col border-[8px] border-double border-[#91a4c4] px-[7%] pb-[4%] pt-[6%]">
        {(!wordless || page.isCover) && <p className="min-h-[18%] text-center font-display text-[clamp(1.1rem,3.3vw,1.8rem)] font-bold leading-relaxed">{page.text}</p>}
        <div className="flex min-h-0 flex-1 items-center justify-center py-[3%]">
          <StoryScene
            photo={index === 0 ? photo : null}
            facePhotos={firstPageFacePhotos}
            faceLayout={index === 0 ? page.faceLayout : null}
            faceBase={index === 0 ? page.faceBase : null}
            gender={gender}
            illustration={page.illustration}
            integrated={!!page.integrated}
            characterSize={150}
            className="w-full max-w-[92%] shadow-none"
          />
        </div>
        {wordless && !page.isCover && (
          <div className="mb-[3%] space-y-[6%] px-[4%]" aria-label="מקום לכתיבת הסיפור">
            {[0, 1, 2].map((line) => <div key={line} className="border-b border-[#7889a6]/60" />)}
          </div>
        )}
        <span className="text-center text-xs font-semibold text-[#7889a6]">{index + 1} / {total}</span>
      </div>
    </article>
  );
}
