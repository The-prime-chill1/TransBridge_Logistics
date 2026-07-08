import { useEffect } from 'react'
import Hero from './Hero'
import RouteSection from './RouteSection'
import ServicesSection from './ServicesSection'
import TrackingShowcase from './TrackingShowcase'
import WhyUsSection from './WhyUsSection'
import TestimonialsSection from './TestimonialsSection'
import CTASection from './CTASection'

export default function Home() {
  useEffect(() => {
    document.title = 'TransBridge Logistics — Across Borders, On Time.'
  }, [])

  return (
    <div>
      <Hero />
      <RouteSection />
      <ServicesSection />
      <TrackingShowcase />
      <WhyUsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
