import { useEffect, useState } from 'react'
import { Clock } from './components/clock/clock'
import { ShortcutSection } from './components/shortcutSection/shortcutSection'
import { Settings } from './components/settings/settings'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)



  if (!localStorage.getItem("shortcuts")) {
    localStorage.setItem("shortcuts", JSON.stringify([
      ["https://en.wikipedia.org/", "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/120px-Wikipedia-logo-v2.svg.png"],
      ["https://www.youtube.com/", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1280px-YouTube_full-color_icon_%282017%29.svg.png"],
      ["https://www.reddit.com/", "https://www.iconpacks.net/icons/2/free-reddit-logo-icon-2436-thumb.png"],
      ["https://stardance.hackclub.com", "https://stardance.hackclub.com/assets/favicon-cdc48065.png"],
      ["https://skyfonix.cigoria.eu/", "https://skyfonix.cigoria.eu/favicon.ico"]
    ]))

  }
  if (!localStorage.getItem("searchEngine")) {
    localStorage.setItem("searchEngine", "0")
  }
  async function loadAPOD() {
    try {
      const result = await fetch("/api/getAPOD")
      const jsonResult = await result.json()
      if (jsonResult.image) {
        document.body.style.backgroundImage = `url("${jsonResult.image}")`
        document.body.style.backgroundSize = "cover"
        document.body.style.backgroundPosition = "center"
        document.body.style.backgroundRepeat = "no-repeat"
      }
    } catch (e) {
      console.log(e)
      return
    }
  }
  useEffect(loadAPOD, [])

  const [shortcuts, setShortcuts] = useState(JSON.parse(localStorage.getItem("shortcuts")))
  const [searchEngine, setSearchEngine] = useState(localStorage.getItem("searchEngine"))

  return (
    <>
      <div className='screenCover' style={{ display: settingsOpen ? "initial" : "none" }}>
        <Settings setShortcuts={setShortcuts} shortcuts={shortcuts} onClose={() => { setSettingsOpen(false) }} searchEngine={searchEngine} setSearchEngine={setSearchEngine}></Settings>
      </div>
      <main>
        <Clock></Clock>
        <ShortcutSection searchEngine={searchEngine} shortcuts={shortcuts}></ShortcutSection>
        <button className='openSettings' onClick={() => { setSettingsOpen(true) }}><img src="settings.webp" alt="settingsicon" /></button>
      </main>
    </>
  )
}

export default App
