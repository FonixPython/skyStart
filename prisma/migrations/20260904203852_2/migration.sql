/*
  Warnings:

  - Added the required column `lastUpdate` to the `Sync` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notes" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "lastUpdate" DATETIME NOT NULL
);
INSERT INTO "new_Sync" ("id", "notes", "settings") SELECT "id", "notes", "settings" FROM "Sync";
DROP TABLE "Sync";
ALTER TABLE "new_Sync" RENAME TO "Sync";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
