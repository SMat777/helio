export type Point = [number, number]

// Normaliserer en talserie til SVG-koordinater i en wxh-boks (kilde: Sparkline i tether-primitives.jsx).
export function sparklinePoints(data: number[], w = 100, h = 30, pad = 2): Point[] {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)
  return data.map((v, i) => [pad + i * step, pad + (h - pad * 2) * (1 - (v - min) / range)])
}

// Bygger SVG-linjestien fra punkterne.
export function sparklinePath(points: Point[]): string {
  return 'M' + points.map((p) => p.join(' ')).join(' L ')
}
