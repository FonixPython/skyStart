import "./shortcutSection.css"
import { use, useState } from "react"

export function ShortcutSection() {
    const [shortcuts, setShortcuts] = useState(JSON.parse(localStorage.getItem("shortcuts")))
    const [searchEngine, setSearchEngine] = useState(localStorage.getItem("searchEngine"))

    return (
        <div className="shortcutSection">
            <form action={searchEngine} method="GET">
                <input type="text" placeholder="Search on google" name="q" />
            </form>
            <div className="shortcutGrid">
                {shortcuts.map((link) => (
                    <a href={link}>
                        <img src={link + "/favicon.ico"} />
                    </a>
                ))}
            </div>
        </div>
    )
}