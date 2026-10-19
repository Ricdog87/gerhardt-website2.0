// Motion-Kern: Smooth Scroll, Scroll-Animationen, Szenenwechsel. Bei reduzierter Bewegung bleibt alles statisch.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const EXPO = 'expo.out';

let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

/** Scrollen sperren und freigeben, mit oder ohne Lenis */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  } else {
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }
}

export function initSmoothScroll() {
  // Auf Touch-Geräten scrollt der Finger nativ; Lenis würde dort nur Rechenzeit kosten
  if (reduced || lenis || !finePointer) return;
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -72 }, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Zeilen einer Überschrift aus einer Maske fahren lassen. Gibt die Animation zurück (pausiert, wenn kein Trigger). */
export function splitLines(el: HTMLElement, opts: { trigger?: boolean; delay?: number } = {}) {
  const { trigger = true, delay = 0 } = opts;
  let tween: gsap.core.Tween | undefined;
  let played = false;
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    // aria-label ist nur auf Überschriften erlaubt; Zeilen-Spans lesen Screenreader ohnehin normal vor
    aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none',
    onSplit(self) {
      self.masks.forEach((m) => m.classList.add('split-mask'));
      el.style.visibility = 'visible';
      el.style.animation = 'none';
      // Nach einem Resize neu aufgeteilte Zeilen nicht erneut verstecken
      if (played) return;
      tween = gsap.from(self.lines, {
        yPercent: 115,
        duration: 1.4,
        ease: EXPO,
        stagger: 0.09,
        delay,
        paused: !trigger,
        onStart: () => {
          played = true;
        },
        scrollTrigger: trigger ? { trigger: el, start: 'top 88%', once: true } : undefined,
      });
      return tween;
    },
  });
  return () => tween;
}

/** Erst nach der ersten Scrollbewegung ausführen (oder sofort, wenn die Seite schon gescrollt geladen wurde) */
function afterFirstScroll(fn: () => void) {
  if (window.scrollY > 10) fn();
  else window.addEventListener('scroll', fn, { once: true, passive: true });
}

/** Einmalig ausführen, sobald ein Element den (erweiterten) Viewport erreicht. IntersectionObserver statt
 * ScrollTrigger, damit beim Neuvermessen nicht Dutzende Trigger Layout erzwingen. */
function observeOnce(el: Element, rootMargin: string, fn: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { rootMargin },
  );
  io.observe(el);
}

/** Erst ausführen, wenn das Element in die Nähe des Viewports kommt: spart Arbeit beim Laden */
export function whenNear(el: HTMLElement, fn: () => void) {
  observeOnce(el, '0px 0px 35% 0px', fn);
}

function initSplits() {
  document.querySelectorAll<HTMLElement>('[data-split]:not([data-split="manual"])').forEach((el) => {
    whenNear(el, () => splitLines(el, { delay: Number(el.dataset.splitDelay ?? 0) }));
  });
}

/** data-reveal: Einblenden, sobald das Element ins Bild kommt (bei Bildern ist das Bild darin zugeklappt, nicht der Rahmen) */
function initReveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    observeOnce(el, '0px 0px -8% 0px', () => el.classList.add('is-visible'));
  });
}

/** Text Wort für Wort aufhellen, gekoppelt an die Scrollposition */
function initWordScrub() {
  // Abgedunkelte Wörter erst mit der ersten Scrollbewegung, damit der Text beim Laden vollen Kontrast hat
  document.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    afterFirstScroll(() => {
      const split = SplitText.create(el, { type: 'words', aria: 'none' });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 },
        },
      );
    });
  });
}

/** Parallaxe: data-parallax="0.2" verschiebt das Element relativ zu seinem Rahmen */
function initParallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 0.15) * 100;
    const trigger = el.closest<HTMLElement>('[data-parallax-frame]') ?? el.parentElement ?? el;
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      { yPercent: amount / 2, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/** Zahlen hochzählen: <span data-count="150000">150.000</span> */
function initCounters() {
  const fmt = new Intl.NumberFormat('de-DE');
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const state = { v: target * 0.6 };
    const render = () => {
      el.textContent = fmt.format(Math.round(state.v / 1000) * 1000);
    };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        render();
        gsap.to(state, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: render });
      },
    });
  });
}

/** Szenenwechsel: die Seite blendet zwischen hell, sand, dunkel und Bühne über */
function initScenes() {
  const sections = document.querySelectorAll<HTMLElement>('[data-scene]');
  if (!sections.length) return;
  const root = document.documentElement;
  const set = (scene: string) => {
    if (root.dataset.scene !== scene) root.dataset.scene = scene;
  };
  let current = sections[0].dataset.scene!;
  let live = false;
  sections.forEach((section) => {
    // Gepinnte Sektionen über ihren Pin-Spacer messen, sonst endet die Szene vor dem Ende des Pins
    const trigger = section.parentElement?.classList.contains('pin-spacer') ? section.parentElement : section;
    ScrollTrigger.create({
      trigger,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return;
        current = section.dataset.scene!;
        if (live) set(current);
      },
    });
  });
  // Bis zur ersten Scrollbewegung behält jede Sektion ihren eigenen Hintergrund (voller Kontrast beim Laden)
  const activate = () => {
    if (live) return;
    live = true;
    set(current);
    root.classList.add('scenes-ready');
  };
  afterFirstScroll(activate);
}

/** Rundes Label „Ansehen“ folgt der Maus über Bildern */
function initCursor() {
  if (!finePointer) return;
  const targets = document.querySelectorAll<HTMLElement>('[data-cursor]');
  if (!targets.length) return;
  const label = document.createElement('div');
  label.className = 'cursor-label';
  label.setAttribute('aria-hidden', 'true');
  document.body.append(label);
  const x = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3.out' });
  const y = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    x(e.clientX);
    y(e.clientY);
  });
  targets.forEach((t) => {
    t.addEventListener('pointerenter', () => {
      label.textContent = t.dataset.cursor || 'Ansehen';
      gsap.to(label, { scale: 1, duration: 0.5, ease: EXPO });
    });
    t.addEventListener('pointerleave', () => gsap.to(label, { scale: 0, duration: 0.4, ease: 'power3.out' }));
  });
}

/** Buttons folgen der Maus ein Stück */
function initMagnetic() {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.28);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}

/** FAQ: weiches Auf- und Zuklappen der <details> */
function initAccordions() {
  document.querySelectorAll<HTMLDetailsElement>('details[data-accordion]').forEach((d) => {
    const summary = d.querySelector('summary');
    const body = d.querySelector<HTMLElement>('[data-accordion-body]');
    if (!summary || !body) return;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => {
            d.open = false;
            gsap.set(body, { clearProps: 'height,opacity' });
            ScrollTrigger.refresh();
          },
        });
      } else {
        d.open = true;
        gsap.fromTo(
          body,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.7, ease: EXPO, onComplete: () => ScrollTrigger.refresh() },
        );
      }
    });
  });
}

let started = false;

export function startMotion() {
  if (started) return;
  started = true;
  if (reduced) {
    document.documentElement.classList.remove('motion');
    return;
  }
  document.documentElement.classList.add('motion-ready');
  initSmoothScroll();
  initReveals();
  initSplits();
  initWordScrub();
  initParallax();
  initCounters();
  // Nicht für den ersten Eindruck nötig: erst, wenn der Browser Luft hat
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
  idle(() => {
    initCursor();
    initMagnetic();
    initAccordions();
  });
  // Komponenten legen ihre Szenen danach an. Reihenfolge der Trigger nach Position sortieren und
  // nach dem Laden von Webfonts und Bildern neu vermessen.
  // ScrollTrigger vermisst beim load-Event ohnehin neu. Nur Webfonts, die danach eintreffen, brauchen eine Extra-Runde.
  requestAnimationFrame(() => {
    initScenes();
    ScrollTrigger.sort();
    if (document.readyState === 'complete') ScrollTrigger.refresh();
  });
  document.fonts?.ready.then(() => {
    if (document.readyState === 'complete') ScrollTrigger.refresh();
  });
}
