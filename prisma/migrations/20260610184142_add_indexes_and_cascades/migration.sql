-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_userId_fkey";

-- DropForeignKey
ALTER TABLE "SkillProgress" DROP CONSTRAINT "SkillProgress_userId_fkey";

-- CreateIndex
CREATE INDEX "Answer_userId_idx" ON "Answer"("userId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "Question_area_topic_idx" ON "Question"("area", "topic");

-- CreateIndex
CREATE INDEX "SkillProgress_userId_idx" ON "SkillProgress"("userId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
