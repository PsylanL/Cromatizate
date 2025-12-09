-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "colorBlindness" TEXT,
    "preferences" JSONB,
    "deviceInfo" JSONB,
    "notes" TEXT,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorInteraction" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemanticOutput" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "jsonld" JSONB NOT NULL,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SemanticOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorProgress" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VisitorInteraction" ADD CONSTRAINT "VisitorInteraction_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemanticOutput" ADD CONSTRAINT "SemanticOutput_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorProgress" ADD CONSTRAINT "VisitorProgress_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
