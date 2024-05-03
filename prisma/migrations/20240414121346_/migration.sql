/*
  Warnings:

  - Added the required column `title` to the `MusicList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MusicList" ADD COLUMN     "title" TEXT NOT NULL;
