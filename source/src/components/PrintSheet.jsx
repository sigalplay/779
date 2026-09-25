import { brandLogo } from "@/lib/language";
import { pageUrl } from "@/lib/seo";

const COPYRIGHT = {
  he: "© בואו נשחק. כל הזכויות שמורות. התכנים נועדו להעשרה ולתרגול בלבד ואינם מהווים אבחון, המלצה טיפולית אישית או תחליף להערכה, לייעוץ או לטיפול של איש מקצוע מוסמך.",
  en: "© Let's Play. All rights reserved. The content here is for enrichment and practice only. It is not a diagnosis, personal therapeutic advice, or a substitute for evaluation, consultation, or treatment by a qualified professional.",
};

// The printed page of an activity, recipe or experiment (styles: styles/activity-print-sheet.css).
// Title with the main picture and a link back to the site (it stays clickable in a PDF sent on
// WhatsApp), the lists passed as children, and the copyright line. The copyright sits in the table
// footer, which the browser repeats at the bottom of every printed page.
export function PrintSheet({ language, title, hero, heroAlt, path, children }) {
  const english = language === "en";
  const siteUrl = pageUrl(path, language);
  const siteUrlText = siteUrl.replace(/^https:\/\//, "").replace(/\/$/, "");
  return (
    <div className="activity-print-sheet hidden print:block print:text-black">
      <table className="print-sheet-frame">
        <tfoot>
          <tr>
            <td>
              <div className="print-sheet-footer">
                <p>{english ? COPYRIGHT.en : COPYRIGHT.he}</p>
                <a href={siteUrl}><bdi dir="ltr">{siteUrlText}</bdi></a>
              </div>
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td>
              <div className="print-sheet-head">
                {hero ? <img src={hero} alt={heroAlt} className="print-sheet-hero" /> : null}
                <div className="min-w-0 flex-1">
                  <h1 className="print-sheet-title">{title}</h1>
                  <a href={siteUrl} className="print-sheet-link">{english ? "View on the site: " : "לצפייה באתר: "}<bdi dir="ltr">{siteUrlText}</bdi></a>
                </div>
                <img src={brandLogo(language)} alt={english ? "Let's Play" : "בואו נשחק"} className="print-sheet-logo" />
              </div>
              {children}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// One printed list (materials, ingredients, tools or steps): tick box, picture, numbered text.
export function PrintTable({ heading, rows }) {
  if (!rows?.length) return null;
  return (
    <section className="print-sheet-section">
      <h2 className="print-sheet-heading">{heading}</h2>
      <table className="print-sheet-table">
        <colgroup>
          <col className="print-sheet-col-check" />
          <col className="print-sheet-col-image" />
          <col />
        </colgroup>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="print-sheet-check"><span aria-hidden /></td>
              <td className="print-sheet-image">{row.image}</td>
              <td className="print-sheet-text"><strong className="print-sheet-number">{row.number}.</strong> {row.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
