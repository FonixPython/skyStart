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
  if (!localStorage.getItem("snapToGrid")) {
    localStorage.setItem("snapToGrid", "0")
  }
  if (!localStorage.getItem("sync")) {
    localStorage.setItem("sync", "0")
  }
  if (!localStorage.getItem("syncId")) {
    localStorage.setItem("syncId", "")
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
  const [snapToGrid, setSnapToGrid] = useState((localStorage.getItem("snapToGrid") == "0") ? false : true)
  const [sync, setSync] = useState(localStorage.getItem("sync") == "0" ? false : true)
  const [syncId, setSyncId] = useState(localStorage.getItem("syncId"))


  useEffect(() => {
    const handleStorage = () => {
      setShortcuts(JSON.parse(localStorage.getItem("shortcuts")))
      setSearchEngine(localStorage.getItem("searchEngine"))
      setNotes(JSON.parse(localStorage.getItem("notes")))
      setSnapToGrid((localStorage.getItem("snapToGrid") == "0") ? false : true)
      setSync(localStorage.getItem("sync") ? false : true)
      setSyncId(localStorage.getItem("syncId"))
    }
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])


  useEffect(() => {
    const handleAuxClick = (e) => {
      if (e.button == 1) {
        const relativeX = e.clientX / window.innerWidth
        const relativeY = e.clientY / window.innerHeight
        setNotes(notes => {
          const id = uuidv4()
          const updatedNotes = {
            ...notes,
            [id]: {
              id: id,
              x: relativeX,
              y: relativeY,
              text: "",
              isCollapsed: false
            }
          }
          localStorage.setItem("notes", JSON.stringify(updatedNotes))
          return updatedNotes
        })
      }
    }

    window.addEventListener("auxclick", (e) => { handleAuxClick(e) })
    return () => {
      window.removeEventListener("auxclick", (e) => { handleAuxClick(e) })
    }
  }, [])

  document.body.auxclick = (e) => {
    console.log("a")
    if (e && (e.which == 2 || e.button == 4)) {
      console.log('middleclicked')
    }
  }

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

  const doSync = async () => {
    if (sync && syncId != "") {
      const lastUpdate = await fetch("/api/getLastUpdate/" + localStorage.getItem("syncId"))
      if (lastUpdate.ok) {
        const lastUpdateJson = await lastUpdate.json()
        if (new Date(lastUpdateJson.lastUpdate) > new Date(localStorage.getItem("lastUpdate")) || !localStorage.getItem("lastUpdate")) {
          const newNotes = await fetch("/api/getNotes/" + localStorage.getItem("syncId"))
          const newNotesJson = await newNotes.json()
          setNotes(JSON.parse(newNotesJson.notes))
          localStorage.setItem("notes", newNotesJson.notes)
          const newSettings = await fetch("/api/getSettings/" + localStorage.getItem("syncId"))
          const newSettingsJson = await newSettings.json()
          setShortcuts(newSettingsJson.settings.shortcuts)
          localStorage.setItem("shortcuts", JSON.stringify(newSettingsJson.settings.shortcuts))
          setSearchEngine(newSettingsJson.settings.searchEngine)
          localStorage.setItem("searchEngine", newSettingsJson.settings.searchEngine)
          setSnapToGrid((newSettingsJson.settings.snapToGrid == "0") ? false : true)
          localStorage.setItem("snapToGrid", JSON.stringify(newSettingsJson.settings.snapToGrid))
          localStorage.setItem("lastUpdate", lastUpdateJson.lastUpdate)
        }
        else if (new Date(lastUpdateJson.lastUpdate) < new Date(localStorage.getItem("lastUpdate"))) {
          const notesResult = await fetch("/api/updateNotes/" + localStorage.getItem("syncId"), {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              updatedNotes: Object.values(JSON.parse(localStorage.getItem("notes")))
            })
          })
          if (notesResult.ok) {
            const settingsResult = await fetch("/api/updateSettings/" + localStorage.getItem("syncId"), {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                updatedSettings: {
                  blurBackground: (localStorage.getItem("blurBackground") == "1") ? true : false,
                  searchEngine: searchEngine,
                  shortcuts: shortcuts,
                  snapToGrid: snapToGrid
                }
              })
            })
          }
        }
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      doSync()
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  })

  return (
    <>
      <div className='screenCover' style={{ display: settingsOpen ? "initial" : "none" }}>
        <Settings setShortcuts={setShortcuts} shortcuts={shortcuts} onClose={() => { setSettingsOpen(false) }} searchEngine={searchEngine} setSearchEngine={setSearchEngine} snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid} sync={sync} setSync={setSync} syncId={syncId} setSyncId={setSyncId}></Settings>
      </div>
      {notesVisible && Object.values(notes).map((note) => (
        <SticykNote notes={notes} id={note.id} setNotes={setNotes} key={note.id} snapToGrid={snapToGrid} />
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
