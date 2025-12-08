import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HeroSection } from "@/components/home/HeroSection"
import { HowItWorksSection } from "@/components/home/HowItWorks"
import { DemoSection } from "@/components/home/DemoSection"
import { FeaturesSection } from "@/components/home/FeaturesSection"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <HeroSection />
        <HowItWorksSection />
        <DemoSection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  )
}
