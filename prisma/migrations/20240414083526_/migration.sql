-- AlterTable
ALTER TABLE "Music" ADD COLUMN     "musicListId" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicList" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MusicList" ADD CONSTRAINT "MusicList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_musicListId_fkey" FOREIGN KEY ("musicListId") REFERENCES "MusicList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
