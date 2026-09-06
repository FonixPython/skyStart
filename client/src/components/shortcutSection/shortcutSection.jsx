import "./shortcutSection.css"
import { use, useEffect, useState } from "react"

export function ShortcutSection(props) {
    const searchEngineDict = [
        ["Google", "https://www.google.com/search"],
        ["DuckDuckGo", "https://duckduckgo.com/search"],
        ["Ecosia", "https://www.ecosia.org/"],
        ["Brave Search", "https://search.brave.com/search"]
    ]
    window.onload = function () {
        document.getElementById("search").focus()
    }
    return (
        <div className="shortcutSection">
            <form action={searchEngineDict[props.searchEngine][1]} method="GET">
                <input id="search" type="text" placeholder={"Search on " + searchEngineDict[props.searchEngine][0]} name="q" />
            </form>
            <div className="shortcutGrid">
                {props.shortcuts.map((link) => (
                    <a href={link[0]}>
                        <img src={link[1]} />
                    </a>
                ))}
            </div>
        </div>
    )
}