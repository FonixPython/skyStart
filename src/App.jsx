import { useState } from 'react'
import { Clock } from './components/clock/clock'
import { ShortcutSection } from './components/shortcutSection/shortcutSection'

function App() {
  if (!localStorage.getItem("shortcuts")) {
    localStorage.setItem("shortcuts", JSON.stringify(["https://en.wikipedia.org/", "https://www.youtube.com/", "https://www.reddit.com/", "https://skyfonix.cigoria.eu/", "https://stardance.hackclub.com"]))
  }
  if (!localStorage.getItem("searchEngine")) {
    localStorage.setItem("searchEngine", "https://www.google.com/search")
  }
  return (
    <main>
      <Clock></Clock>
      <ShortcutSection></ShortcutSection>
    </main>
  )
}

export default App
