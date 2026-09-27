import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const script = await readFile(resolve(root, "script.js"), "utf8");

const requiredFiles = [
  "script.js",
  "assets/images/shino-portrait.jpeg",
  "assets/images/shino-banner.png",
  "assets/fonts/OpenSauceSans-Regular.otf",
  "assets/fonts/OpenSauceSans-Medium.otf",
  "assets/fonts/OpenSauceSans-SemiBold.otf",
  "assets/fonts/OpenSauceSans-ExtraBold.otf",
  "assets/fonts/OFL.txt",
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const checks = [
  [html.includes("shino05220628@gmail.com"), "approved email is present"],
  [!html.match(/\+81|80-3924|github/i), "phone number and GitHub are absent"],
  [html.includes('href="#about"'), "About anchor exists"],
  [html.includes('href="#experience"'), "Experience anchor exists"],
  [html.includes('href="#stories"'), "Stories anchor exists"],
  [html.includes('href="#contact"'), "Contact anchor exists"],
  [html.includes("prefers-reduced-motion") || css.includes("prefers-reduced-motion"), "reduced motion is supported"],
  [css.includes("overflow-x: hidden"), "horizontal overflow guard exists"],
  [html.includes("scroll-progress") && script.includes("--scroll-progress"), "scroll progress motion is connected"],
  [html.includes("data-magnetic") && script.includes("[data-magnetic]"), "magnetic interactions are connected"],
  [html.includes("data-tilt") && script.includes("[data-tilt]"), "story-card depth interactions are connected"],
  [script.includes("prefersReducedMotion") && script.includes("motionEnabled"), "scripted motion respects user preferences"],
  [html.includes("data-smooth-release") && script.includes("is-releasing") && css.includes(".contact-link.reveal.is-releasing"), "email-link magnetic return is smoothed"],
  [!html.includes('class="marquee"') && !css.includes(".marquee-track"), "agency-style marquee is removed"],
  [!html.match(/Shino is|Shino taught|Shino helped|She has|she makes|Shino’s practice/), "profile narrative uses first-person language"],
  [css.includes("max-height: calc(100dvh - 5rem)"), "desktop hero is capped to the viewport"],
  [script.includes('addEventListener(\n    "wheel"') && script.includes("renderSmoothScroll"), "wheel scrolling uses eased motion"],
  [script.includes('a[href^="#"]:not(.skip-link)') && script.includes("animateAnchor"), "anchor navigation uses eased motion"],
  [script.includes("motionEnabled && canHover.matches"), "enhanced scrolling respects motion and input preferences"],
  [html.includes('class="site-cursor"') && html.includes('class="cursor-ring"'), "custom cursor structure is present"],
  [css.includes("body.has-custom-cursor") && css.includes(".site-cursor.is-interactive"), "custom cursor styling and hover state are present"],
  [script.includes('addEventListener("pointermove"') && script.includes("renderCursor"), "custom cursor tracking is connected"],
  [html.includes('class="cursor-glyph"') && css.includes(".site-cursor.is-interactive .cursor-glyph"), "cursor variation reveals a directional glyph on interaction"],
  [css.includes(".cursor-dot::before") && css.includes("rotate(45deg)"), "resting cursor uses a crosshair and diamond frame"],
  [css.includes("border-radius: 0.9rem") && css.includes("rotate(0)"), "interactive cursor morphs into a rounded action marker"],
  [script.includes('glyph = "↑"') && script.includes('? "↑" : "↓"'), "anchor cursor direction follows page navigation"],
  [script.includes('glyph = "VIEW"') && css.includes(".site-cursor.is-story"), "story cards use a contextual view cursor"],
  [html.includes('class="cursor-email-character"') && html.includes("cursor-mouth-smile"), "email cursor includes an illustrated character"],
  [script.includes('glyph = "✉"') && css.includes("cursor-character-blink") && css.includes("cursor-smile-mouth"), "email character blinks and smiles beside the cursor"],
  [!html.includes("Say hello!"), "email cursor no longer uses plain encouragement text"],
];

for (const [passed, description] of checks) {
  if (!passed) throw new Error(`Check failed: ${description}`);
  console.log(`✓ ${description}`);
}

console.log("Static site checks passed.");
