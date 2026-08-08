import express from "express";
import dotenv from "dotenv";
import path from "path";
import os from "os";
import fs from "fs";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = Number(process.env.PORT) || 3000;
const backend = express()

backend.use(express.static(path.join(__dirname, "dist")));
backend.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"))
})
backend.get("/api/getAPOD", async (req, res) => {
    if (!fs.existsSync("./cache.json")) {
        const apiResult = await fetch(
            "https://api.nasa.gov/planetary/apod?" +
            new URLSearchParams({
                api_key: process.env.API_KEY,
                thumbs: "true"
            }).toString()
        );
        const apiResultJson = await apiResult.json();
        const saveObject = {
            image: apiResultJson.hdurl,
            date: apiResultJson.date
        };
        await fsPromises.writeFile("./cache.json", JSON.stringify(saveObject));
        return res.json({ image: apiResultJson.hdurl });
    } else {
        const fileData = JSON.parse(await fsPromises.readFile("./cache.json", "utf8"));
        const date = new Date();
        const today = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
        if (fileData.date === today) {
            return res.json({ image: fileData.image });
        } else {
            const apiResult = await fetch(
                "https://api.nasa.gov/planetary/apod?" +
                new URLSearchParams({
                    api_key: process.env.API_KEY,
                    thumbs: "true"
                }).toString()
            );
            const apiResultJson = await apiResult.json();
            const saveObject = {
                image: apiResultJson.hdurl,
                date: apiResultJson.date
            };
            await fsPromises.writeFile("./cache.json", JSON.stringify(saveObject));
            return res.json({
                image: apiResultJson.hdurl
            });
        }
    }
});


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