import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";

const baseClasses =
  "group relative block overflow-hidden border border-white/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

function CardContent({ image, title, description, large = false, showArrow = false, captionClassName, language, eager = false }) {
  return (
    <>
      <img
        src={image}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        alt={language === "en" ? `Illustration for ${title}` : `איור של ${title}`}
        title={`${title} — ${language === "en" ? "Let's Play" : "בואו נשחק"}`}
        data-seo-name={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 border-t border-white/70 bg-[#fffaf2]/90 backdrop-blur-[2px]",
          large ? "px-5 py-4 md:px-6 md:py-5" : "px-4 py-3",
          captionClassName,
        )}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className={cn("font-display font-black text-foreground", large ? "text-2xl md:text-3xl" : "text-base leading-snug")}>
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p> : null}
          </div>
          {showArrow ? (
            <span className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm">
              {language === "en" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function IllustratedNavCard({ to, image, title, description, large = false, showArrow = false, className, captionClassName, eager = false }) {
  const { language } = useTranslator();
  return (
    <Link
      to={to}
      className={cn(baseClasses, language === "en" ? "text-left" : "text-right", large ? "min-h-[330px] rounded-3xl md:min-h-[370px]" : "min-h-[190px] rounded-2xl", className)}
    >
      <CardContent image={image} title={title} description={description} large={large} showArrow={showArrow} captionClassName={captionClassName} language={language} eager={eager} />
    </Link>
  );
}

export function IllustratedNavButton({ onClick, image, title, description, large = false, className, captionClassName }) {
  const { language } = useTranslator();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        baseClasses,
        language === "en" ? "text-left" : "text-right",
        "w-full",
        large ? "min-h-[330px] rounded-3xl md:min-h-[370px]" : "min-h-[190px] rounded-2xl",
        className,
      )}
    >
      <CardContent image={image} title={title} description={description} large={large} showArrow captionClassName={captionClassName} language={language} />
    </button>
  );
}
