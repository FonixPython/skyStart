import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import os from "os";
import fs from "fs";

import { registerSync, deleteSync, updateNotes, updateSettings, getLastUpdate, getNotes, getSettings } from "./sync.js"

import fsPromises from "fs/promises";
import { fileURLToPath } from "url";


interface save {
    image: string,
    date: string
}
interface nasaReturn {
    hdurl: string,
    date: string
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cachePath = path.join(__dirname, "cache.json");


dotenv.config();
const PORT = Number(process.env.PORT) || 3000;
const backend = express()
backend.use(express.json());

backend.use(express.static(path.join(__dirname, "public")));
backend.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})


backend.get("/api/getAPOD", async (req: Request, res: Response) => {
    if (!fs.existsSync(cachePath)) {
        const fetchParameters = new URLSearchParams({
            api_key: process.env.API_KEY || "",
            thumbs: "true"
        }).toString()
        const apiResult = await fetch(
            "https://api.nasa.gov/planetary/apod?" +
            fetchParameters
        );
        const apiResultJson = await apiResult.json() as nasaReturn;
        const saveObject: save = {
            image: apiResultJson.hdurl,
            date: apiResultJson.date
        };
        await fsPromises.writeFile(cachePath, JSON.stringify(saveObject));
        return res.json({ image: apiResultJson.hdurl });
    } else {
        const fileData = JSON.parse(await fsPromises.readFile(cachePath, "utf8"));
        const date = new Date();
        const today = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
        if (fileData.date === today) {
            return res.json({ image: fileData.image });
        } else {
            const fetchParameters = new URLSearchParams({
                api_key: process.env.API_KEY || "",
                thumbs: "true"
            }).toString()
            const apiResult = await fetch(
                "https://api.nasa.gov/planetary/apod?" +
                fetchParameters
            );
            const apiResultJson = await apiResult.json() as nasaReturn;
            const saveObject: save = {
                image: apiResultJson.hdurl,
                date: apiResultJson.date
            };
            await fsPromises.writeFile(cachePath, JSON.stringify(saveObject));
            return res.json({
                image: apiResultJson.hdurl
            });
        }
    }
});

backend.get("/api/registerSync", registerSync)
backend.delete("/api/deleteSync/:syncId", deleteSync)
backend.post("/api/updateNotes/:syncId", updateNotes)
backend.post("/api/updateSettings/:syncId", updateSettings)
backend.get("/api/getLastUpdate", getLastUpdate)
backend.get("/api/getNotes", getNotes)
backend.get("/api/getSettings", getSettings)

function getIPv4Addresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        const networkInterface = interfaces[name];
        if (networkInterface) {
            for (const inter of networkInterface) {
                if (inter.family === "IPv4" && !inter.internal) {
                    addresses.push(inter.address);
                }
            }
        }
    }
    return addresses;
}

backend.listen(PORT, () => {
    console.log("Server is Running");
    console.log(`http://localhost:${PORT}`);

    const ipAddresses = getIPv4Addresses();
    ipAddresses.forEach((ip) => {
        console.log(`http://${ip}:${PORT}`);
    });
});