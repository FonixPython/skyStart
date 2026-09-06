import "./clock.css"
import { useState, useEffect } from "react"

export function Clock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)
        return () => {
            clearInterval(timer)
        }
    })

    return (
        <div className="clock">
            <p className="time">
                {String(time.getHours()).padStart(2, "0")}:{String(time.getMinutes()).padStart(2, "0")}
            </p>
            <p className="date">
                {String(time.getFullYear())}.{String(time.getMonth() + 1)}.{String(time.getDate())}
            </p>
        </div>
    )
}