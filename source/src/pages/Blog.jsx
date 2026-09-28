import { Fragment, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTranslator } from "@/lib/language";
import { BLOG_AUTHOR, BLOG_CATEGORIES, blogCategory, findPost, formatPostDate, publishedPosts, readingMinutes } from "@/lib/blog";

// Names of the site pages an article can send readers to.
const PAGE_NAMES = {
  "/parent/social-stories": ["מחולל סיפורים חברתיים", "Social story builder"],
  "/parent/morning-routine": ["לוח התארגנות בוקר", "Morning routine board"],
  "/parent/evening-routine": ["לוח התארגנות ערב", "Evening routine board"],
  "/parent/weekly-board": ["לוח שבועי", "Weekly board"],
  "/parent/recipes": ["מתכונים לילדים", "Recipes for kids"],
  "/parent/experiments": ["ניסויים לילדים", "Science experiments for kids"],
  "/parent/board-games": ["משחקי קופסה לילדים", "Board games for kids"],
  "/parent/play": ["רעיונות למשחק", "Play ideas"],
  "/parent/all": ["כל הפעילויות לילדים", "All activities for kids"],
};

// "[words](/path)" inside a paragraph becomes a link to that page.
function RichText({ text }) {
  const parts = String(text).split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return match
      ? <Link key={index} to={match[2]} className="font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">{match[1]}</Link>
      : <Fragment key={index}>{part}</Fragment>;
  });
}

function ArticleBody({ blocks }) {
  return blocks.map(([type, value], index) => {
    if (type === "h2") return <h2 key={index} className="pt-4 font-display text-2xl font-black">{value}</h2>;
    if (type === "ul" || type === "ol") {
      const List = type;
      return (
        <List key={index} className={type === "ul" ? "list-disc space-y-2 ps-6" : "list-decimal space-y-2 ps-6"}>
          {value.map((item) => <li key={item}><RichText text={item} /></li>)}
        </List>
      );
    }
    if (type === "tip") {
      return (
        <aside key={index} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <p><RichText text={value} /></p>
        </aside>
      );
    }
    return <p key={index}><RichText text={value} /></p>;
  });
}

function PostCard({ post, language, t }) {
  const category = blogCategory(post.category);
  const content = post[language];
  return (
    <Link to={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid aspect-[16/9] place-items-center" style={{ background: category?.color }}>
        <img src={post.image} alt="" loading="lazy" className="h-4/5 w-auto object-contain transition group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-bold text-primary">{category ? t(category.he, category.en) : ""}</span>
        <h2 className="font-display text-lg font-black leading-snug">{content.title}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{content.description}</p>
        <span className="mt-auto pt-2 text-xs text-muted-foreground">
          {formatPostDate(post.date, language)} · {t(`${readingMinutes(post, language)} דקות קריאה`, `${readingMinutes(post, language)} min read`)}
        </span>
      </div>
    </Link>
  );
}

export function BlogIndex() {
  const { language, t } = useTranslator();
  const [params, setParams] = useSearchParams();
  const active = blogCategory(params.get("category"))?.id || null;
  const posts = publishedPosts();
  const shown = active ? posts.filter((post) => post.category === active) : posts;
  // Only categories that already have articles.
  const categories = BLOG_CATEGORIES.filter((category) => posts.some((post) => post.category === category.id));
  const chip = (selected) => `rounded-full border px-4 py-2 text-sm font-bold transition ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground hover:text-foreground"}`;

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, []);

  return (
    <AppShell mode="parent">
      <div className="space-y-8 pb-8">
        <header className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-9">
          <p className="mb-2 text-sm font-bold text-primary">{t("מהקליניקה אל הבית", "From the clinic to your home")}</p>
          <h1 className="font-display text-3xl font-black md:text-4xl">{t("הבלוג של בואו נשחק", "The Let's Play Blog")}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {t("מאמרים קצרים ומעשיים של מרפאה בעיסוק: מוטוריקה, ויסות, שגרה, סיפורים חברתיים ומשחק – עם רעיונות שאפשר לנסות כבר היום.",
              "Short, practical articles by an occupational therapist: motor skills, regulation, routines, social stories and play – with ideas you can try today.")}
          </p>
        </header>

        {categories.length > 1 && (
          <nav className="flex flex-wrap gap-2" aria-label={t("קטגוריות", "Categories")}>
            <button type="button" className={chip(!active)} onClick={() => setParams({})}>{t("הכול", "All")}</button>
            {categories.map((category) => (
              <button key={category.id} type="button" className={chip(active === category.id)} onClick={() => setParams({ category: category.id })}>
                {t(category.he, category.en)}
              </button>
            ))}
          </nav>
        )}

        {shown.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((post) => <PostCard key={post.slug} post={post} language={language} t={t} />)}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">{t("עוד אין כאן מאמרים. בקרוב!", "No articles here yet. Coming soon!")}</p>
        )}
      </div>
    </AppShell>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const { language, t } = useTranslator();
  const post = findPost(slug);
  const Back = language === "en" ? ArrowLeft : ArrowRight;

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [slug]);

  if (!post) {
    return (
      <AppShell mode="parent">
        <div className="mx-auto max-w-2xl space-y-4 py-10 text-center">
          <h1 className="font-display text-2xl font-black">{t("המאמר לא נמצא", "Article not found")}</h1>
          <Link to="/blog" className="font-bold text-primary underline">{t("לכל המאמרים", "All articles")}</Link>
        </div>
      </AppShell>
    );
  }

  const content = post[language];
  const category = blogCategory(post.category);
  const more = publishedPosts().filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);

  return (
    <AppShell mode="parent">
      <article className="mx-auto max-w-3xl space-y-6 pb-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground" aria-label={t("מיקום באתר", "Breadcrumb")}>
          <Link to="/blog" className="inline-flex items-center gap-1 hover:text-foreground"><Back className="h-4 w-4" />{t("הבלוג", "Blog")}</Link>
          {category && <><span aria-hidden>/</span><Link to={`/blog?category=${category.id}`} className="hover:text-foreground">{t(category.he, category.en)}</Link></>}
        </nav>

        <header className="space-y-4">
          <h1 className="font-display text-3xl font-black leading-tight md:text-4xl">{content.title}</h1>
          <p className="text-lg leading-8 text-muted-foreground">{content.description}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>{t(BLOG_AUTHOR.he, BLOG_AUTHOR.en)}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /><time dateTime={post.date}>{formatPostDate(post.date, language)}</time></span>
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{t(`${readingMinutes(post, language)} דקות קריאה`, `${readingMinutes(post, language)} min read`)}</span>
          </div>
        </header>

        <div className="grid aspect-[16/8] place-items-center rounded-3xl" style={{ background: category?.color }}>
          <img src={post.image} alt={content.title} className="h-4/5 w-auto object-contain" />
        </div>

        <div className="space-y-4 text-[1.05rem] leading-8 text-foreground/90">
          <ArticleBody blocks={content.body} />
        </div>

        {post.links?.length > 0 && (
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="mb-3 font-display text-lg font-black">{t("לנסות עכשיו באתר", "Try it now on the site")}</h2>
            <div className="flex flex-wrap gap-2">
              {post.links.map((href) => (
                <Link key={href} to={href} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  {PAGE_NAMES[href] ? t(...PAGE_NAMES[href]) : href}
                </Link>
              ))}
            </div>
          </section>
        )}

        {more.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="font-display text-xl font-black">{t("עוד מאמרים בנושא", "More on this topic")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {more.map((item) => <PostCard key={item.slug} post={item} language={language} t={t} />)}
            </div>
          </section>
        )}
      </article>
    </AppShell>
  );
}
