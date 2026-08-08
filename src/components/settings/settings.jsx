import { useState } from "react"
import "./settings.css"

export function Settings(props) {
    const searchEngineDict = [
        ["Google", "https://www.google.com/search"],
        ["DuckDuckGo", "https://duckduckgo.com/search"],
        ["Ecosia", "https://www.ecosia.org/"],
        ["Brave Search", "https://search.brave.com/search"]
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        const index = Number(name.split("-")[1])
        const type = (name.split("-")[0] == "link") ? 0 : 1
        const updatedShortcuts = [...props.shortcuts]
        updatedShortcuts[index][type] = value
        props.setShortcuts(updatedShortcuts)
        localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts))
    }

    const handleDelete = (e) => {
        const index = Number(e.target.name)
        let updatedShortcuts = [...props.shortcuts]
        updatedShortcuts.splice(index, 1)
        props.setShortcuts(updatedShortcuts)
        localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts))
    }

    const handleAdd = () => {
        const updatedShortcuts = [...props.shortcuts]
        updatedShortcuts.push([])
        props.setShortcuts(updatedShortcuts)
        localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts))
    }

    const handleEngineChange = (e) => {
        const { value } = e.target
        props.setSearchEngine(value)
        localStorage.setItem("searchEngine", value)
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