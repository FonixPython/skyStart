import { useState } from "react"
import "./settings.css"

export function Settings(props) {
    const searchEngineDict = [
        ["Google", "https://www.google.com/search"],
        ["DuckDuckGo", "https://duckduckgo.com/search"],
        ["Ecosia", "https://www.ecosia.org/"],
        ["Brave Search", "https://search.brave.com/search"]
    ]
    const [blurBackground, setBlurBackground] = useState((localStorage.getItem("blurBackground") == "1") ? true : false)

    const handleChange = (e) => {
        const { name, value } = e.target
        const index = Number(name.split("-")[1])
        const type = (name.split("-")[0] == "link") ? 0 : 1
        const updatedShortcuts = [...props.shortcuts]
        updatedShortcuts[index][type] = value
        props.setShortcuts(updatedShortcuts)
        localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts))
        localStorage.setItem("lastUpdate", new Date().toISOString())
    }

    const handleDelete = (e) => {
        const index = Number(e.target.name)
        let updatedShortcuts = [...props.shortcuts]
        updatedShortcuts.splice(index, 1)
        props.setShortcuts(updatedShortcuts)
        localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts))
        localStorage.setItem("lastUpdate", new Date().toISOString())
    }

    const handleAdd = () => {
        const updatedShortcuts = [...props.shortcuts]
        updatedShortcuts.push([])
        props.setShortcuts(updatedShortcuts)
        localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts))
        localStorage.setItem("lastUpdate", new Date().toISOString())
    }

    const handleEngineChange = (e) => {
        const { value } = e.target
        props.setSearchEngine(value)
        localStorage.setItem("searchEngine", value)
        localStorage.setItem("lastUpdate", new Date().toISOString())
    }

    const handleBackgroundBlur = (e) => {
        const { checked } = e.target
        setBlurBackground(checked)
        localStorage.setItem("blurBackground", checked ? "1" : "0")
        if (checked) {
            document.body.style.backdropFilter = "blur(4px)"
        } else {
            document.body.style.backdropFilter = ""
        }
    }


    const handleSnapToGrid = (e) => {
        const { checked } = e.target
        localStorage.setItem("snapToGrid", checked ? "1" : "0")
        props.setSnapToGrid(checked)
        localStorage.setItem("lastUpdate", new Date().toISOString())
    }

    const handleSyncChange = (e) => {
        const { checked } = e.target
        localStorage.setItem("sync", checked ? "1" : "0")
        props.setSync(checked)
    }

    const handleSyncIdChange = (e) => {
        const { value } = e.target
        localStorage.setItem("syncId", value)
        props.setSyncId(value)
    }

    const generateSyncId = async () => {
        const result = await fetch("/api/registerSync")
        const resultJson = await result.json()
        if (result.ok) {
            localStorage.setItem("syncId", resultJson.id)
            props.setSyncId(resultJson.id)
            const notesResult = await fetch("/api/updateNotes/" + resultJson.id, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    updatedNotes: Object.values(JSON.parse(localStorage.getItem("notes")))
                })
            })
            if (notesResult.ok) {
                const settingsResult = await fetch("/api/updateSettings/" + resultJson.id, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        updatedSettings: {
                            blurBackground: (localStorage.getItem("blurBackground") == "1") ? true : false,
                            searchEngine: props.searchEngine,
                            shortcuts: props.shortcuts,
                            snapToGrid: props.snapToGrid
                        }
                    })
                })
            }
        }
        localStorage.setItem("lastUpdate", new Date().toISOString())
    }

    const deleteSync = async () => {
        const result = await fetch("/api/deleteSync/" + props.syncId, { method: "DELETE" })
        if (result.ok) {
            localStorage.setItem("syncId", "")
            props.setSyncId("")
            props.setSync(false)
        }
    }

    return (
        <div className="settings">
            <button onClick={props.onClose} className="closeButton">X</button>
            <p>Search Engine:</p>
            <select onChange={handleEngineChange} value={props.searchEngine}>
                {searchEngineDict.map((engine, i) => (
                    <option value={i}>{engine[0]}</option>
                ))}
            </select>
            <hr />
            <div className="backgroundBlur">
                <p>Blur background:</p>
                <input type="checkbox" onChange={handleBackgroundBlur} checked={blurBackground} />
            </div>
            <hr />
            <div className="backgroundBlur">
                <p>Snap to grid:</p>
                <input type="checkbox" onChange={handleSnapToGrid} checked={props.snapToGrid} />
            </div>
            <hr />
            <div className="backgroundBlur">
                <p>Sync:</p>
                <input type="checkbox" onChange={handleSyncChange} checked={props.sync} />
            </div>
            {props.sync && <div className="shortcutsContainer">
                <input type="text" disabled={!props.sync} value={props.syncId} onChange={handleSyncIdChange} />
                <div style={{ display: "flex", width: "95%", alignItems: "center", justifyContent: "center" }}>
                    <button disabled={!props.sync} onClick={generateSyncId}>Generate ID</button>
                    <button disabled={!props.sync} style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={deleteSync}>Delete Sync</button>
                </div>
            </div>}
            <hr />
            <p>Shortcuts:</p>
            <button onClick={handleAdd}>Add shortcut</button>
            <div className="shortcutsContainer">
                {props.shortcuts.map((shortcut, i) => {
                    return (
                        <div className="shortcutCard">
                            <input type="text" value={shortcut[0]} name={"link-" + i} onChange={handleChange} />
                            <input type="text" value={shortcut[1]} name={"icon-" + i} onChange={handleChange} />
                            <button onClick={handleDelete} name={i}>Delete</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}