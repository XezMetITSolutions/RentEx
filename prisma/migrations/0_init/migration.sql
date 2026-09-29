-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT,
    "category" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "engineSize" TEXT,
    "horsePower" INTEGER,
    "fuelConsumption" TEXT,
    "co2Emission" TEXT,
    "status" TEXT NOT NULL,
    "vin" TEXT,
    "chassisNumber" TEXT,
    "dailyRate" DECIMAL(65,30) NOT NULL,
    "weeklyRate" DECIMAL(65,30),
    "monthlyRate" DECIMAL(65,30),
    "longTermRate" DECIMAL(65,30),
    "minDaysForLongTerm" INTEGER,
    "depositAmount" DECIMAL(65,30),
    "promoPrice" DECIMAL(65,30),
    "promoStartDate" TIMESTAMP(3),
    "promoEndDate" TIMESTAMP(3),
    "insuranceCompany" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceValidUntil" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3),
    "nextInspection" TIMESTAMP(3),
    "currentMileage" INTEGER,
    "purchaseMileage" INTEGER,
    "maxMileagePerDay" INTEGER,
    "imageUrl" TEXT,
    "images" TEXT,
    "description" TEXT,
    "features" TEXT,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "hasGPS" BOOLEAN NOT NULL DEFAULT false,
    "hasHeatedSeats" BOOLEAN NOT NULL DEFAULT false,
    "hasParkingSensors" BOOLEAN NOT NULL DEFAULT false,
    "hasBackupCamera" BOOLEAN NOT NULL DEFAULT false,
    "hasCruiseControl" BOOLEAN NOT NULL DEFAULT false,
    "hasBluetoothAudio" BOOLEAN NOT NULL DEFAULT false,
    "hasUSBPorts" BOOLEAN NOT NULL DEFAULT false,
    "hasChildSeatAnchors" BOOLEAN NOT NULL DEFAULT false,
    "hasSkiRack" BOOLEAN NOT NULL DEFAULT false,
    "hasTowHitch" BOOLEAN NOT NULL DEFAULT false,
    "vignetteValidUntil" TIMESTAMP(3),
    "vignetteType" TEXT,
    "lastOilChange" TIMESTAMP(3),
    "nextOilChange" TIMESTAMP(3),
    "lastTireChange" TIMESTAMP(3),
    "tireType" TEXT,
    "nextServiceDate" TIMESTAMP(3),
    "lastServiceDate" TIMESTAMP(3),
    "locationId" INTEGER,
    "homeLocationId" INTEGER,
    "purchasePrice" DECIMAL(65,30),
    "purchaseDate" TIMESTAMP(3),
    "currentValue" DECIMAL(65,30),
    "internalNotes" TEXT,
    "damageHistory" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "checkInTemplate" TEXT,
    "nextServiceKm" INTEGER,
    "extraKmCost" DECIMAL(65,30),
    "fuelPolicy" TEXT,
    "includedInsurance" TEXT,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Österreich',
    "phone" TEXT,
    "email" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "openingTime" TEXT,
    "closingTime" TEXT,
    "isOpenSundays" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageRecord" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "rentalId" INTEGER,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "photoUrl" TEXT,
    "locationOnCar" TEXT,
    "xPosition" DOUBLE PRECISION,
    "yPosition" DOUBLE PRECISION,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "repairCost" DECIMAL(65,30),
    "accidentCountry" TEXT DEFAULT 'Österreich',
    "accidentDate" TIMESTAMP(3),
    "accidentPlace" TEXT,
    "accidentTime" TEXT,
    "circumstances" TEXT,
    "injuries" BOOLEAN DEFAULT false,
    "otherPartyAddress" TEXT,
    "otherPartyDamage" TEXT,
    "otherPartyDriverName" TEXT,
    "otherPartyInsurance" TEXT,
    "otherPartyPhone" TEXT,
    "otherPartyPolicyNumber" TEXT,
    "otherPartyRegistration" TEXT,
    "otherPartyVehicle" TEXT,
    "reportedByCustomerId" INTEGER,
    "sketchNotes" TEXT,
    "witnessAddress" TEXT,
    "witnessName" TEXT,
    "witnessPhone" TEXT,
    "accidentReportUrl" TEXT,
    "driverAddress" TEXT,
    "driverLicense" TEXT,
    "driverName" TEXT,
    "photos" TEXT,
    "sketchUrl" TEXT,
    "vin" TEXT,

    CONSTRAINT "DamageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FahrtenbuchEntry" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "rentalId" INTEGER,
    "datum" TIMESTAMP(3) NOT NULL,
    "startKm" INTEGER NOT NULL,
    "endKm" INTEGER NOT NULL,
    "zweck" TEXT NOT NULL,
    "fahrtzweck" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FahrtenbuchEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCoupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(65,30) NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "minOrderAmount" DECIMAL(65,30),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "triggerType" TEXT,

    CONSTRAINT "DiscountCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'todo',
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "relatedCarId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "type" TEXT,
    "isPerDay" BOOLEAN NOT NULL DEFAULT false,
    "maxPrice" DECIMAL(65,30),
    "maxDays" INTEGER,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "carCategory" TEXT,
    "groupId" INTEGER,
    "carId" INTEGER,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Österreich',
    "idType" TEXT,
    "idNumber" TEXT,
    "licenseNumber" TEXT,
    "licenseIssueDate" TIMESTAMP(3),
    "licenseExpiryDate" TIMESTAMP(3),
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "company" TEXT,
    "taxId" TEXT,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "customerType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordHash" TEXT,
    "agbAcceptedAt" TIMESTAMP(3),
    "agbAcceptedVersion" TEXT,
    "gdprConsentDate" TIMESTAMP(3),
    "gdprConsentVersion" TEXT,
    "gdprDeleteRequestedAt" TIMESTAMP(3),
    "idAustriaVerified" BOOLEAN DEFAULT false,
    "idAustriaVerifiedAt" TIMESTAMP(3),
    "isEuResident" BOOLEAN DEFAULT true,
    "nonEuApprovedAt" TIMESTAMP(3),
    "nonEuApprovedBy" TEXT,
    "referralCode" TEXT,
    "referredById" INTEGER,
    "idPhotoUrl" TEXT,
    "licensePhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "licenseCountry" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "pickupLocationId" INTEGER,
    "returnLocationId" INTEGER,
    "pickupMileage" INTEGER,
    "returnMileage" INTEGER,
    "dailyRate" DECIMAL(65,30) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "depositPaid" DECIMAL(65,30),
    "depositReturned" DECIMAL(65,30),
    "extraCharges" DECIMAL(65,30) DEFAULT 0,
    "extraChargesNote" TEXT,
    "discountAmount" DECIMAL(65,30) DEFAULT 0,
    "discountReason" TEXT,
    "insuranceType" TEXT,
    "insuranceCost" DECIMAL(65,30),
    "hasGPS" BOOLEAN NOT NULL DEFAULT false,
    "hasChildSeat" BOOLEAN NOT NULL DEFAULT false,
    "hasSkiRack" BOOLEAN NOT NULL DEFAULT false,
    "extrasCost" DECIMAL(65,30) DEFAULT 0,
    "fuelLevelPickup" TEXT,
    "fuelLevelReturn" TEXT,
    "fuelCharge" DECIMAL(65,30) DEFAULT 0,
    "paymentStatus" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL,
    "contractNumber" TEXT,
    "notes" TEXT,
    "damageReport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeSessionId" TEXT,
    "checkInAt" TIMESTAMP(3),
    "signature" TEXT,
    "fuelPhoto" TEXT,
    "mileagePhoto" TEXT,
    "checkoutCompletedAt" TIMESTAMP(3),
    "checkoutPhotos" TEXT,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "mahnung1SentAt" TIMESTAMP(3),
    "mahnung2SentAt" TIMESTAMP(3),
    "mahnung3SentAt" TIMESTAMP(3),
    "returnPhotos" TEXT,
    "includedKm" INTEGER DEFAULT 0,
    "driverLicense" TEXT,
    "driverName" TEXT,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 20,
    "taxAmount" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "pdfPath" TEXT,
    "registrierkassaExportedAt" TIMESTAMP(3),
    "registrierkassaBelegId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerCountry" TEXT,
    "vatRegion" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(65,30),
    "mileage" INTEGER,
    "performedBy" TEXT,
    "performedDate" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "nextDueMileage" INTEGER,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceUrl" TEXT,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "relatedType" TEXT,
    "relatedId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "locationId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorBackupCodes" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "customerId" INTEGER,
    "staffId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartSession" (
    "id" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "options" TEXT,
    "guestEmail" TEXT,
    "customerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KmBalance" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KmBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KmTransfer" (
    "id" SERIAL NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KmTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralBonus" (
    "id" SERIAL NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "referredId" INTEGER NOT NULL,
    "bonusType" TEXT NOT NULL,
    "bonusValue" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "referralRentalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgbVersion" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgbVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrafzettelRecord" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "rentalId" INTEGER,
    "plate" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "issuedTime" TEXT,
    "incidentLocation" TEXT,
    "amount" DECIMAL(65,30),
    "authority" TEXT,
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "forwardedToCustomerAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "notes" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrafzettelRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmtlicheAnfrage" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER,
    "rentalId" INTEGER,
    "authority" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "incidentDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "responseNote" TEXT,
    "respondedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmtlicheAnfrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MahnungRecord" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MahnungRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOption" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitorCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorPrice" (
    "id" SERIAL NOT NULL,
    "dailyRate" DECIMAL(65,30) NOT NULL,
    "brand" TEXT NOT NULL,
    "competitorId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "monthlyRate" DECIMAL(65,30),
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weeklyRate" DECIMAL(65,30),

    CONSTRAINT "CompetitorPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "iso" CHAR(2) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "nicename" VARCHAR(80) NOT NULL,
    "iso3" CHAR(3),
    "numcode" INTEGER,
    "phonecode" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_plate_key" ON "Car"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Car_vin_key" ON "Car"("vin");

-- CreateIndex
CREATE INDEX "Car_status_idx" ON "Car"("status");

-- CreateIndex
CREATE INDEX "Car_locationId_idx" ON "Car"("locationId");

-- CreateIndex
CREATE INDEX "Car_category_idx" ON "Car"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CarCategory_name_key" ON "CarCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE INDEX "DamageRecord_carId_idx" ON "DamageRecord"("carId");

-- CreateIndex
CREATE INDEX "DamageRecord_rentalId_idx" ON "DamageRecord"("rentalId");

-- CreateIndex
CREATE INDEX "DamageRecord_status_idx" ON "DamageRecord"("status");

-- CreateIndex
CREATE INDEX "FahrtenbuchEntry_carId_datum_idx" ON "FahrtenbuchEntry"("carId", "datum");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCoupon_code_key" ON "DiscountCoupon"("code");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");

-- CreateIndex
CREATE INDEX "Task_relatedCarId_idx" ON "Task"("relatedCarId");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_referralCode_key" ON "Customer"("referralCode");

-- CreateIndex
CREATE INDEX "Customer_referredById_idx" ON "Customer"("referredById");

-- CreateIndex
CREATE INDEX "Customer_isBlacklisted_idx" ON "Customer"("isBlacklisted");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_contractNumber_key" ON "Rental"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_stripeSessionId_key" ON "Rental"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Rental_carId_idx" ON "Rental"("carId");

-- CreateIndex
CREATE INDEX "Rental_customerId_idx" ON "Rental"("customerId");

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");

-- CreateIndex
CREATE INDEX "Rental_paymentStatus_idx" ON "Rental"("paymentStatus");

-- CreateIndex
CREATE INDEX "Rental_startDate_endDate_idx" ON "Rental"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Rental_isOverdue_idx" ON "Rental"("isOverdue");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_rentalId_key" ON "Invoice"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Payment_rentalId_idx" ON "Payment"("rentalId");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_carId_idx" ON "MaintenanceRecord"("carId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_nextDueDate_idx" ON "MaintenanceRecord"("nextDueDate");

-- CreateIndex
CREATE INDEX "Notification_status_createdAt_idx" ON "Notification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_relatedType_relatedId_idx" ON "Notification"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_customerId_idx" ON "PushToken"("customerId");

-- CreateIndex
CREATE INDEX "PushToken_staffId_idx" ON "PushToken"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "CartSession_sessionKey_key" ON "CartSession"("sessionKey");

-- CreateIndex
CREATE INDEX "CartSession_expiresAt_idx" ON "CartSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CartSession_carId_idx" ON "CartSession"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "KmBalance_customerId_key" ON "KmBalance"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "AgbVersion_version_key" ON "AgbVersion"("version");

-- CreateIndex
CREATE INDEX "StrafzettelRecord_carId_idx" ON "StrafzettelRecord"("carId");

-- CreateIndex
CREATE INDEX "StrafzettelRecord_rentalId_idx" ON "StrafzettelRecord"("rentalId");

-- CreateIndex
CREATE INDEX "StrafzettelRecord_status_idx" ON "StrafzettelRecord"("status");

-- CreateIndex
CREATE INDEX "MahnungRecord_rentalId_idx" ON "MahnungRecord"("rentalId");

-- CreateIndex
CREATE INDEX "RentalOption_rentalId_idx" ON "RentalOption"("rentalId");

-- CreateIndex
CREATE INDEX "RentalOption_optionId_idx" ON "RentalOption"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorCompany_name_key" ON "CompetitorCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorPrice_competitorId_brand_model_recordedAt_key" ON "CompetitorPrice"("competitorId", "brand", "model", "recordedAt");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_homeLocationId_fkey" FOREIGN KEY ("homeLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageRecord" ADD CONSTRAINT "DamageRecord_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageRecord" ADD CONSTRAINT "DamageRecord_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageRecord" ADD CONSTRAINT "DamageRecord_reportedByCustomerId_fkey" FOREIGN KEY ("reportedByCustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FahrtenbuchEntry" ADD CONSTRAINT "FahrtenbuchEntry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FahrtenbuchEntry" ADD CONSTRAINT "FahrtenbuchEntry_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedCarId_fkey" FOREIGN KEY ("relatedCarId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "OptionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_returnLocationId_fkey" FOREIGN KEY ("returnLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartSession" ADD CONSTRAINT "CartSession_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KmBalance" ADD CONSTRAINT "KmBalance_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KmTransfer" ADD CONSTRAINT "KmTransfer_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KmTransfer" ADD CONSTRAINT "KmTransfer_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralBonus" ADD CONSTRAINT "ReferralBonus_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralBonus" ADD CONSTRAINT "ReferralBonus_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrafzettelRecord" ADD CONSTRAINT "StrafzettelRecord_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrafzettelRecord" ADD CONSTRAINT "StrafzettelRecord_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MahnungRecord" ADD CONSTRAINT "MahnungRecord_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOption" ADD CONSTRAINT "RentalOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOption" ADD CONSTRAINT "RentalOption_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorPrice" ADD CONSTRAINT "CompetitorPrice_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "CompetitorCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
