import { Request, Response } from "express";
import { prisma } from "./db";
import { syncBuiltinESMExports } from "module";
import { createSecureContext } from "tls";
import { settings } from "cluster";

export async function registerSync(req: Request, res: Response) {
    try {
        const result = await prisma.sync.create({ data: { lastUpdate: Date(), notes: "{}", "settings": "{}" } })
        return res.json({ id: result.id })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

export async function deleteSync(req: Request, res: Response) {
    try {
        const syncId = Array.isArray(req.params.syncId) ? req.params.syncId[0] : req.params.syncId;
        const result = await prisma.sync.delete({ where: { id: syncId } })
        if (result) {
            return res.sendStatus(200)
        } else {
            return res.sendStatus(404)
        }
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

interface Note {
    id: string,
    x: number,
    y: number,
    text: string,
    isCollapsed: boolean
}

export async function updateNotes(req: Request, res: Response) {
    try {
        if (req.body.updatedNotes || Array.isArray(req.body.updatedNotes)) {
            res.sendStatus(400)
        }
        const syncId = Array.isArray(req.params.syncId) ? req.params.syncId[0] : req.params.syncId;
        try {
            const current = await prisma.sync.findFirstOrThrow({ where: { id: syncId } })
            const updatedNotesObject = { ...JSON.parse(current.notes) }
            req.body.updatedNotes.map((note: Note) => {
                updatedNotesObject[note.id] = note
            })
            const result = await prisma.sync.update({ where: { id: syncId }, data: { notes: JSON.stringify(updatedNotesObject), lastUpdate: Date() } })
            if (result) {
                res.sendStatus(200)
            } else {
                res.sendStatus(500)
            }
        } catch {
            return res.sendStatus(404)
        }
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}


export async function updateSettings(req: Request, res: Response) {
    try {
        if (req.body.updatedSettings || Array.isArray(req.body.updatedSettings)) {
            res.sendStatus(400)
        }
        const syncId = Array.isArray(req.params.syncId) ? req.params.syncId[0] : req.params.syncId;
        try {
            const current = await prisma.sync.findFirstOrThrow({ where: { id: syncId } })
            const result = await prisma.sync.update({ where: { id: syncId }, data: { settings: JSON.stringify(req.body.updatedSettings) } })
            if (result) {
                res.sendStatus(200)
            } else {
                res.sendStatus(500)
            }
        } catch {
            return res.sendStatus(404)
        }
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

export async function getLastUpdate(req: Request, res: Response) {
    try {
        const syncId = Array.isArray(req.params.syncId) ? req.params.syncId[0] : req.params.syncId;
        const result = await prisma.sync.findFirstOrThrow({ where: { id: syncId } })
        return res.json({ lastUpdate: result.lastUpdate })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

export async function getNotes(req: Request, res: Response) {
    try {
        const syncId = Array.isArray(req.params.syncId) ? req.params.syncId[0] : req.params.syncId;
        const result = await prisma.sync.findFirstOrThrow({ where: { id: syncId } })
        return res.json({ notes: JSON.parse(result.notes), lastUpdate: result.lastUpdate })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

export async function getSettings(req: Request, res: Response) {
    try {
        const syncId = Array.isArray(req.params.syncId) ? req.params.syncId[0] : req.params.syncId;
        const result = await prisma.sync.findFirstOrThrow({ where: { id: syncId } })
        return res.json({ settings: JSON.parse(result.settings), lastUpdate: result.lastUpdate })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}