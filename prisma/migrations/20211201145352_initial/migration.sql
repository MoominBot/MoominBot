-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "ronb" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "Guild"("id");
