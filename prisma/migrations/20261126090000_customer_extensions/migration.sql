-- CreateTable
CREATE TABLE "RentalExtension" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Requested',
    "previousEnd" TIMESTAMP(3) NOT NULL,
    "newEnd" TIMESTAMP(3) NOT NULL,
    "previousTotal" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "additionalAmount" DECIMAL(65,30) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "includedKm" INTEGER NOT NULL,
    "extrasCost" DECIMAL(65,30) NOT NULL,
    "insuranceCost" DECIMAL(65,30) NOT NULL,
    "stripeSessionId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalExtension_stripeSessionId_key" ON "RentalExtension"("stripeSessionId");

-- CreateIndex
CREATE INDEX "RentalExtension_rentalId_status_idx" ON "RentalExtension"("rentalId", "status");

-- AddForeignKey
ALTER TABLE "RentalExtension" ADD CONSTRAINT "RentalExtension_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
