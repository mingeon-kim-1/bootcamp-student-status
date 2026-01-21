-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BootcampConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "seatsPerRow" INTEGER NOT NULL DEFAULT 10,
    "totalRows" INTEGER NOT NULL DEFAULT 5,
    "seatDirection" TEXT NOT NULL DEFAULT 'bottom-right-horizontal',
    "displayTitle" TEXT NOT NULL DEFAULT 'Bootcamp Status',
    "useCustomLayout" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Branding" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "loginImagePath" TEXT,
    "loginText" TEXT,
    "displayImagePath" TEXT,
    "displayText" TEXT,
    "organizationName" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeatPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seatNumber" INTEGER NOT NULL,
    "gridRow" INTEGER NOT NULL,
    "gridCol" INTEGER NOT NULL,
    "label" TEXT
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "lastActive" DATETIME,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SeatPosition_seatNumber_key" ON "SeatPosition"("seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_seatNumber_key" ON "Student"("seatNumber");
