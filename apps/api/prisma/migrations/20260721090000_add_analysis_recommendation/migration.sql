-- AlterTable
-- DEFAULT '' solo para no romper filas ya existentes (el análisis de prueba
-- de ayer); las filas nuevas siempre traerán un valor real desde la app.
ALTER TABLE "ProjectAnalysis" ADD COLUMN "recommendation" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProjectAnalysis" ALTER COLUMN "recommendation" DROP DEFAULT;
