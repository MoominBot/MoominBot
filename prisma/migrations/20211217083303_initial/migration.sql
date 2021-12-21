-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "ronb" TEXT,
    "modlog" TEXT
);

-- CreateTable
CREATE TABLE "ModLogCase" (
    "id" SERIAL NOT NULL,
    "guild" TEXT NOT NULL,
    "case_id" SERIAL NOT NULL,
    "moderator" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT E'N/A',
    "type" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "message" TEXT,
    "channel" TEXT,

    CONSTRAINT "ModLogCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "Guild"("id");
