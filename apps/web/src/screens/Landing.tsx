import Hero from './landing/Hero'
import Problem from './landing/Problem'
import LensTabs from './landing/LensTabs'
import RiskBandViz from './landing/RiskBandViz'
import CaseLens from './landing/CaseLens'
import Decisions from './landing/Decisions'
import Cta from './landing/Cta'
import Byline from './landing/Byline'
import './landing/landing.css'

export default function Landing() {
  return (
    <main className="landing">
      <Hero />
      <Problem />
      <LensTabs />
      <RiskBandViz />
      <CaseLens />
      <Decisions />
      <Cta />
      <Byline />
    </main>
  )
}
