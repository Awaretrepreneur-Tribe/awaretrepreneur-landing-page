"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Testimonial = {
  name: string;
  wistiaId: string;
  poster: string;
};

type Joiner = {
  firstName: string;
  role: string;
  city: string;
  country: string;
  consent: boolean;
};

const testimonials: Testimonial[] = [
  { name: "Fiona Love", wistiaId: "l988ve66o7", poster: "https://embed-ssl.wistia.com/deliveries/094e2ffb88cf0866729e5bf08639819964c60eda.jpg?image_crop_resized=720x1280" },
  { name: "John C", wistiaId: "bjqbw5gifk", poster: "https://embed-ssl.wistia.com/deliveries/c0f0643f1d301530070d9b8061ec9d7b13d87052.jpg?image_crop_resized=720x1280" },
  { name: "Ben Baker", wistiaId: "w5fweptc6f", poster: "https://embed-ssl.wistia.com/deliveries/8a8b5b89e05d52680272781dda521174.jpg?image_crop_resized=720x1280" },
  { name: "Peter Teys", wistiaId: "zv3uvhqd0m", poster: "https://embed-ssl.wistia.com/deliveries/fdc33517c8c08a6ae1df6c49b25ff8fc3b941531.jpg?image_crop_resized=720x1280" },
  { name: "Shiva", wistiaId: "t0sc6dtlet", poster: "https://embed-ssl.wistia.com/deliveries/967c00af38966e0314aefb10e6d6ea83edfb6842.jpg?image_crop_resized=720x1280" },
  { name: "James Purcell", wistiaId: "popdrcrbwk", poster: "https://embed-ssl.wistia.com/deliveries/3a64da7413834406e2c85a0df15a8dd2b98bd29a.jpg?image_crop_resized=720x1280" },
  { name: "James Last", wistiaId: "c20grpgj8w", poster: "https://embed-ssl.wistia.com/deliveries/7850fdf798cc375ed9096686c028989473c01262.jpg?image_crop_resized=720x1280" },
  { name: "Doug", wistiaId: "imeiqct1yy", poster: "https://embed-ssl.wistia.com/deliveries/56e33e13789352ee5d60c371b2e8ec08da511c3c.jpg?image_crop_resized=720x1280" },
  { name: "Nic Scali", wistiaId: "yppbn2bzfh", poster: "https://embed-ssl.wistia.com/deliveries/84c1f68a63255c33e0d42db747a632fcc0152986.jpg?image_crop_resized=720x1280" },
];

const trustMessages = [
  "100+ members already growing inside the Tribe",
  "Founding membership is limited to the first 500 members",
  "A private community established in 2021",
];

const journeyOptions = ["Solo founder", "Scaling business", "Investor", "C-Suite executive", "Curious / exploring"];
const outcomeOptions = ["Deeper peer support", "Better business connections", "Mentoring and accountability", "Clarity and resilience"];

function scrollToVip() {
  document.getElementById("vip")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function WistiaFrame({ id, title }: { id: string; title: string }) {
  return (
    <iframe
      src={`https://fast.wistia.net/embed/iframe/${id}?seo=false&videoFoam=true`}
      title={title}
      allow="autoplay; fullscreen"
      allowFullScreen
      loading="lazy"
    />
  );
}

function ActivityToast() {
  const [verified, setVerified] = useState<Joiner[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/activity")
      .then((response) => (response.ok ? response.json() : { joiners: [] }))
      .then((data) => setVerified((data.joiners ?? []).filter((item: Joiner) => item.consent)))
      .catch(() => setVerified([]));
  }, []);

  const messages = useMemo(() => {
    const live = verified.map(
      (joiner) => `${joiner.firstName} · ${joiner.role} · ${joiner.city}, ${joiner.country}`,
    );
    return live.length ? live : trustMessages;
  }, [verified]);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 1400);
    const cycle = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % messages.length);
        setVisible(true);
      }, 550);
    }, 5000);
    return () => {
      window.clearTimeout(show);
      window.clearInterval(cycle);
    };
  }, [messages.length]);

  return (
    <aside className={`activity-toast ${visible ? "is-visible" : ""}`} aria-live="polite">
      <span className="activity-pulse" />
      <div>
        <strong>{verified.length ? "A new VIP just joined" : "Awaretrepreneur Tribe"}</strong>
        <p>{messages[index % messages.length]}</p>
      </div>
    </aside>
  );
}

function Capacity({ successfulSubmission }: { successfulSubmission: boolean }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/capacity")
      .then((response) => (response.ok ? response.json() : { remaining: null }))
      .then((data) => setRemaining(Number.isFinite(data.remaining) ? data.remaining : null))
      .catch(() => setRemaining(null));
  }, []);

  const effectiveRemaining =
    successfulSubmission && remaining !== null ? Math.max(0, remaining - 1) : remaining;
  const filled = effectiveRemaining === null ? null : ((500 - effectiveRemaining) / 500) * 100;
  return (
    <div className="capacity" aria-live="polite">
      <div className="capacity-copy">
        <strong>{effectiveRemaining === null ? "First 500 members only" : `${effectiveRemaining} Founding Member places remain`}</strong>
        <span>{effectiveRemaining === null ? "Live availability activates with the CRM feed" : "Live verified availability"}</span>
      </div>
      {filled !== null && (
        <div className="capacity-track"><span style={{ width: `${Math.min(100, Math.max(0, filled))}%` }} /></div>
      )}
    </div>
  );
}

function VipForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState({
    journey: "",
    outcome: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessType: "",
    city: "",
    country: "Australia",
    activityConsent: false,
    companyWebsite: "",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to reserve your place.");
      setStatus("success");
      onSuccess();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success">
        <span>✓</span>
        <h3>You&apos;re on the VIP list.</h3>
        <p>We&apos;ll send your Founding Member invitation and $66 lifetime-rate details to {data.email}.</p>
      </div>
    );
  }

  return (
    <form className="vip-form" onSubmit={submit}>
      <div className="form-progress"><span style={{ width: `${step * 33.333}%` }} /></div>
      <p className="step-label">Step {step} of 3</p>
      {step === 1 && (
        <fieldset>
          <legend>Where are you on the journey?</legend>
          <div className="choice-grid">
            {journeyOptions.map((option) => (
              <button key={option} type="button" className={data.journey === option ? "selected" : ""} onClick={() => { setData({ ...data, journey: option }); setStep(2); }}>
                {option}<span>→</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {step === 2 && (
        <fieldset>
          <legend>What would help most right now?</legend>
          <div className="choice-grid">
            {outcomeOptions.map((option) => (
              <button key={option} type="button" className={data.outcome === option ? "selected" : ""} onClick={() => { setData({ ...data, outcome: option }); setStep(3); }}>
                {option}<span>→</span>
              </button>
            ))}
          </div>
          <button type="button" className="back-button" onClick={() => setStep(1)}>← Back</button>
        </fieldset>
      )}
      {step === 3 && (
        <fieldset>
          <legend>Claim your Founding Member place</legend>
          <p className="form-intro">No payment today. Your invitation will include the $66 AUD/month lifetime founding rate.</p>
          <div className="field-grid">
            <label><span>First name</span><input required value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} /></label>
            <label><span>Last name</span><input required value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} /></label>
            <label><span>Email</span><input required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></label>
            <label><span>Phone</span><input required type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} /></label>
            <label><span>Business type / position</span><input required value={data.businessType} onChange={(e) => setData({ ...data, businessType: e.target.value })} /></label>
            <label><span>City</span><input required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} /></label>
            <label className="full-field"><span>Country</span><input required value={data.country} onChange={(e) => setData({ ...data, country: e.target.value })} /></label>
          </div>
          <label className="consent-row">
            <input type="checkbox" checked={data.activityConsent} onChange={(e) => setData({ ...data, activityConsent: e.target.checked })} />
            <span>You may show my first name, business type and location as recent VIP activity. Optional.</span>
          </label>
          <input className="honeypot" tabIndex={-1} autoComplete="off" value={data.companyWebsite} onChange={(e) => setData({ ...data, companyWebsite: e.target.value })} aria-hidden="true" />
          <button className="gold-button form-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Reserving your place…" : "Join the VIP Pre-Launch List"}</button>
          {status === "error" && <p className="form-error">{message}</p>}
          <button type="button" className="back-button" onClick={() => setStep(2)}>← Back</button>
        </fieldset>
      )}
    </form>
  );
}

export default function Home() {
  const [testimonial, setTestimonial] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const current = testimonials[testimonial];

  function move(direction: number) {
    setVideoOpen(false);
    setTestimonial((value) => (value + direction + testimonials.length) % testimonials.length);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Awaretrepreneur home">
          <img src="/at-logo.png" alt="" />
          <span>Awaretrepreneur Tribe</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#offers">Three ways we help</a>
          <a href="#stories">Stories</a>
        </nav>
        <button className="header-cta" onClick={scrollToVip}>Join VIP</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">The business network built for the whole human</p>
          <h1>Business is hard enough. <em>You shouldn&apos;t have to carry it alone.</em></h1>
          <p className="hero-lead">A global business network combining deep human support, intelligent opportunity matching and practical peer mentoring.</p>
          <button className="gold-button hero-button" onClick={scrollToVip}>Join the VIP Pre-Launch List</button>
          <p className="microcopy">Founding membership $66 AUD/month for life · $99 after launch · No payment today</p>
          <div className="trust-row"><span>★★★★★</span><b>100+ members</b><b>4 continents</b><b>Private since 2021</b></div>
        </div>
        <div className="hero-video">
          <div className="video-label">Why business owners join</div>
          <div className="video-frame"><WistiaFrame id="std83tsp6f" title="Why business owners join the Awaretrepreneur Tribe" /></div>
        </div>
      </section>

      <section className="capacity-band">
        <div><span>VIP Founding Offer</span><strong>$66 AUD/month for life</strong><p>Standard membership will be $99/month after launch.</p></div>
        <Capacity successfulSubmission={submitted} />
        <button onClick={scrollToVip}>Reserve my place →</button>
      </section>

      <section className="problem-solution">
        <div>
          <p className="section-kicker">The gap nobody else fills</p>
          <h2>You don&apos;t need another room full of business cards.</h2>
        </div>
        <div>
          <p>Leading a business can feel lonely—even when you&apos;re surrounded by people. Traditional networking stays superficial. Courses leave you learning alone. Coaching can solve the strategy without supporting the human carrying it.</p>
          <p className="gold-callout">Awaretrepreneur brings the emotional and commercial sides of business growth into one trusted community.</p>
        </div>
      </section>

      <section className="offers" id="offers">
        <div className="section-heading">
          <p className="section-kicker">One community. Three levels of support.</p>
          <h2>Everything the human—and the business—needs to grow.</h2>
        </div>
        <div className="offer-grid">
          <article className="offer-card featured">
            <span className="offer-number">01</span><span className="offer-tag">Your membership</span>
            <h3>Awaretrepreneur Online Networking</h3>
            <p className="offer-price"><strong>$66</strong> AUD/month <s>$99</s></p>
            <p>Live online gatherings where genuine support and business opportunity happen in the same room.</p>
            <ul>
              <li>Purposeful conversations—not pitching circles</li>
              <li>Breakouts matched by geography, industry and opportunity</li>
              <li>Personality and interest profiling for stronger introductions</li>
              <li>Desktop platform and mobile member app</li>
            </ul>
            <button onClick={scrollToVip}>Join the VIP list →</button>
          </article>
          <article className="offer-card">
            <span className="offer-number">02</span><span className="offer-tag">Included with membership</span>
            <h3>Awaretrepreneur Foundations</h3>
            <p className="offer-price"><strong>$7,000</strong> stated value · Included</p>
            <p>A nine-month personal and business development journey that strengthens the leader behind the business.</p>
            <ul>
              <li>Communication and emotional intelligence</li>
              <li>Purpose, resilience and sustainable growth</li>
              <li>Discuss what you&apos;re learning live with other members</li>
              <li>Built-in support so it doesn&apos;t become another unfinished course</li>
            </ul>
            <div className="video-placeholder"><span>▶</span><p>Foundations explainer video coming soon</p></div>
          </article>
          <article className="offer-card">
            <span className="offer-number">03</span><span className="offer-tag">For members ready to go deeper</span>
            <h3>Mentor7 Clans</h3>
            <p className="offer-price"><strong>$500</strong> VIP · <s>$777/month</s></p>
            <p>Six business owners, one experienced mentor, and a confidential two-hour meeting every fortnight.</p>
            <ul>
              <li>Personal and business challenges held together</li>
              <li>Practical advice from experienced peers</li>
              <li>Clear accountability and consistent support</li>
              <li>Tribe membership is required</li>
            </ul>
            <div className="video-placeholder"><span>▶</span><p>Mentor7 explainer video coming soon</p></div>
            <a className="secondary-button" href="https://go.rt-d.com/at-m7-45" target="_blank" rel="noreferrer">Book a Mentor7 discovery call →</a>
          </article>
        </div>
      </section>

      <section className="matching">
        <div>
          <p className="section-kicker">Networking designed to create outcomes</p>
          <h2>Meet the right people—not just more people.</h2>
          <p>Each gathering combines whole-group wisdom with facilitated breakout rooms. Member profiles help create better introductions based on location, industry, personality, interests and the kind of support or opportunity you&apos;re seeking.</p>
        </div>
        <ol>
          <li><span>1</span><div><strong>Show up as a whole person</strong><p>Talk honestly about what&apos;s happening in the business and behind it.</p></div></li>
          <li><span>2</span><div><strong>Enter intelligently matched rooms</strong><p>Connect around shared context, complementary needs and real opportunity.</p></div></li>
          <li><span>3</span><div><strong>Leave with people and next steps</strong><p>Gain perspective, introductions, support and actions that continue beyond the call.</p></div></li>
        </ol>
      </section>

      <section className="stories" id="stories">
        <div className="section-heading">
          <p className="section-kicker">Real members. Real support.</p>
          <h2>Hear what belonging to the Tribe feels like.</h2>
        </div>
        <div className="story-player">
          <button className="story-arrow" onClick={() => move(-1)} aria-label="Previous member story">←</button>
          <div className="story-card">
            {videoOpen ? (
              <WistiaFrame id={current.wistiaId} title={`${current.name}'s Awaretrepreneur testimonial`} />
            ) : (
              <button className="story-poster" onClick={() => setVideoOpen(true)} aria-label={`Play ${current.name}'s testimonial`}>
                <img src={current.poster} alt="" /><span className="play-button">▶</span>
              </button>
            )}
            <div className="story-name"><strong>{current.name}</strong><span>Awaretrepreneur member</span></div>
          </div>
          <button className="story-arrow" onClick={() => move(1)} aria-label="Next member story">→</button>
        </div>
        <div className="story-dots" aria-label="Choose a member story">
          {testimonials.map((item, index) => <button key={item.name} className={index === testimonial ? "active" : ""} onClick={() => { setVideoOpen(false); setTestimonial(index); }} aria-label={`Show ${item.name}'s story`} />)}
        </div>
      </section>

      <section className="founders">
        <div className="founder-copy">
          <p className="section-kicker">Built by business owners who needed it too</p>
          <h2>We created the room we couldn&apos;t find.</h2>
          <blockquote>“I wanted a place where I could grow my business and be real about what I was going through at the same time.”</blockquote>
          <p>The Tribe has grown privately since 2021, bringing together more than 100 members across four continents.</p>
        </div>
        <div className="founder-people">
          <article><img src="/rich-profile.webp" alt="Rich Latimer" /><div><strong>Rich Latimer</strong><span>Founder</span></div></article>
          <article><img src="/martyn-profile.jpg" alt="Martyn Hume Cobbe" /><div><strong>Martyn Hume Cobbe</strong><span>Co-Founder</span></div></article>
        </div>
      </section>

      <section className="vip-section" id="vip">
        <div className="vip-copy">
          <p className="section-kicker">VIP Pre-Public Launch</p>
          <h2>Be one of the first 500 Founding Members.</h2>
          <p>Join the VIP list now and receive your private invitation when membership opens.</p>
          <ul>
            <li><strong>$66 AUD/month for life</strong> instead of $99</li>
            <li><strong>Foundations included</strong>, stated value $7,000</li>
            <li><strong>Mentor7 VIP price $500/month</strong> instead of $777</li>
            <li>Priority invitation to the Byron Bay public launch</li>
          </ul>
          <Capacity successfulSubmission={submitted} />
        </div>
        <VipForm onSuccess={() => setSubmitted(true)} />
      </section>

      <section className="faq">
        <div className="section-heading"><p className="section-kicker">Quick answers</p><h2>Before you join the VIP list.</h2></div>
        <details><summary>Is this a new community?</summary><p>No. Awaretrepreneur has operated privately since 2021 and already includes more than 100 members across four continents.</p></details>
        <details><summary>What happens after I join the VIP list?</summary><p>You&apos;ll receive launch updates and a private invitation to claim the $66 AUD/month Founding Member rate. No payment is taken today.</p></details>
        <details><summary>What makes the networking different?</summary><p>The gatherings combine honest human conversation, practical business wisdom and breakout matching based on geography, industry, personality, interests and opportunity.</p></details>
        <details><summary>Is Foundations really included?</summary><p>Yes. The nine-month Foundations journey, with a stated value of $7,000 AUD, is included with Tribe membership.</p></details>
        <details><summary>Can I join Mentor7 without being a Tribe member?</summary><p>No. Mentor7 is a deeper, separate mentoring experience available only to Awaretrepreneur Tribe members.</p></details>
      </section>

      <footer>
        <div className="brand"><img src="/at-logo.png" alt="" /><span>Awaretrepreneur Tribe</span></div>
        <p>Business changes people. People change the world.</p>
        <button onClick={scrollToVip}>Join the VIP Pre-Launch List →</button>
      </footer>
      <ActivityToast />
    </main>
  );
}
