import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import About from "@/components/sections/About";
import HowItWorks from "@/components/sections/HowItWorks";
import Stats from "@/components/sections/Stats";
import Events from "@/components/sections/Events";
import CallToAction from "@/components/sections/CallToAction";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-3 focus:font-bold focus:text-ink"
      >
        انتقل إلى المحتوى
      </a>
      <Header />
      <main id="main">
        <Hero />
        {/* The "curtain": solid ivory sheet with rounded top that slides over the pinned hero */}
        <div className="curtain relative z-20 rounded-t-[28px] bg-ivory md:rounded-t-[40px]">
          <About />
          <HowItWorks />
          <Stats />
          <Events />
          <CallToAction />
        </div>
      </main>
      <Footer />
    </>
  );
}
