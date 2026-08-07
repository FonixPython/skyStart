import express from "express";
import dotenv from "dotenv";
import path from "path";
import os from "os";
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