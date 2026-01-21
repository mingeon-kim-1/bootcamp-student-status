-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BootcampConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "seatsPerRow" INTEGER NOT NULL DEFAULT 10,
    "totalRows" INTEGER NOT NULL DEFAULT 5,
    "seatDirection" TEXT NOT NULL DEFAULT 'bottom-right-horizontal',
    "displayTitle" TEXT NOT NULL DEFAULT 'Bootcamp Status',
    "useCustomLayout" BOOLEAN NOT NULL DEFAULT false,
    "corridorAfterRows" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BootcampConfig" ("displayTitle", "id", "seatDirection", "seatsPerRow", "totalRows", "updatedAt", "useCustomLayout") SELECT "displayTitle", "id", "seatDirection", "seatsPerRow", "totalRows", "updatedAt", "useCustomLayout" FROM "BootcampConfig";
DROP TABLE "BootcampConfig";
ALTER TABLE "new_BootcampConfig" RENAME TO "BootcampConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
