import { useEffect, useState } from 'react'
import { Clock } from './components/clock/clock'
import { ShortcutSection } from './components/shortcutSection/shortcutSection'
import { Settings } from './components/settings/settings'
import { SticykNote } from './components/stickyNote/stickyNote'
import { v4 as uuidv4 } from 'uuid';

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
  if (!localStorage.getItem("notes")) {
    localStorage.setItem("notes", JSON.stringify({}))
  }
  if (!localStorage.getItem("blurBackground")) {
    localStorage.setItem("blurBackground", "0")
  }

  async function handleBackgroundBlur() {
    const blurred = (localStorage.getItem("blurBackground") == "1") ? true : false
    if (blurred) {
      document.body.style.backdropFilter = "blur(4px)"
    } else {
      document.body.style.backdropFilter = ""
    }
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
  useEffect(handleBackgroundBlur, [])

  const [shortcuts, setShortcuts] = useState(JSON.parse(localStorage.getItem("shortcuts")))
  const [searchEngine, setSearchEngine] = useState(localStorage.getItem("searchEngine"))
  const [notes, setNotes] = useState(JSON.parse(localStorage.getItem("notes")))
  const [notesVisible, setNotesVisible] = useState(true)

  function createNote() {
    const updatedNotes = { ...notes }
    const id = uuidv4()
    updatedNotes[id] = {
      id: id,
      x: 0.5 * Math.random(),
      y: 0.5 * Math.random(),
      text: "",
      isCollapsed: false
    }
    setNotes(updatedNotes)
    localStorage.setItem("notes", JSON.stringify(updatedNotes))
  }

  return (
    <>
      <div className='screenCover' style={{ display: settingsOpen ? "initial" : "none" }}>
        <Settings setShortcuts={setShortcuts} shortcuts={shortcuts} onClose={() => { setSettingsOpen(false) }} searchEngine={searchEngine} setSearchEngine={setSearchEngine}></Settings>
      </div>
      {notesVisible && Object.values(notes).map((note) => (
        <SticykNote notes={notes} id={note.id} setNotes={setNotes} key={note.id} />
      ))}
      <main>
        <Clock></Clock>
        <ShortcutSection searchEngine={searchEngine} shortcuts={shortcuts}></ShortcutSection>
        <button className='openSettings' onClick={() => { setSettingsOpen(true) }}><img src="settings.webp" alt="settingsicon" /></button>
        <div className="notesButtons">
          <button className={notesVisible ? "visible" : ""} onClick={() => { setNotesVisible(!notesVisible) }}><img src={notesVisible ? "invisible.webp" : "visible.webp"} alt="visibillity icon" /></button>
          <button onClick={createNote}><img src="new.webp" alt="New note icon" /></button>
        </div>
      </main>
    </>
  )
}

export default App
