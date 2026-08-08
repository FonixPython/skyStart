import { useState, useRef } from "react"
import "./stickyNote.css"
import Draggable from "react-draggable"

export function SticykNote(props) {
    const nodeRef = useRef(null)

    function onType(e) {
        const updatedNotes = { ...props.notes }
        updatedNotes[props.id].text = e.target.value
        props.setNotes(updatedNotes)
        localStorage.setItem("notes", JSON.stringify(updatedNotes))
    }

    function onCollapse() {
        const updatedNotes = { ...props.notes }
        updatedNotes[props.id].isCollapsed = !props.notes[props.id].isCollapsed
        props.setNotes(updatedNotes)
        localStorage.setItem("notes", JSON.stringify(updatedNotes))
    }

    function onDelete() {
        const updatedNotes = { ...props.notes }
        delete updatedNotes[props.id]
        props.setNotes(updatedNotes)
        localStorage.setItem("notes", JSON.stringify(updatedNotes))
    }

    const onMove = (e, ui) => {
        let currentRelativeX = ui.x / window.innerWidth
        let currentRelativeY = ui.y / window.innerHeight
        const updatedNotes = { ...props.notes }
        updatedNotes[props.id].x = currentRelativeX
        updatedNotes[props.id].y = currentRelativeY
        props.setNotes(updatedNotes)
        localStorage.setItem("notes", JSON.stringify(updatedNotes))
    };

    return (
        <Draggable nodeRef={nodeRef} handle=".header" defaultPosition={{ x: props.notes[props.id].x * window.innerWidth, y: props.notes[props.id].y * window.innerHeight }} bounds="parent" onDrag={onMove}>
            <div className="stickyNote" ref={nodeRef}>
                <div className="header">
                    <button className="collapseButton" onClick={onCollapse}><img src="dropDown.webp" alt="Collapse icon" /></button>
                    <p className="preview">{props.notes[props.id].text}</p>
                    <button className="closeButton" onClick={onDelete}><img src="delete.webp" alt="Delete icon" /></button>
                </div>
                {!props.notes[props.id].isCollapsed && <textarea placeholder="Type here..." value={props.notes[props.id].text} onChange={onType} />}
            </div>
        </Draggable>
    )
}