import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database from snapshot...');

  // Clear existing data (optional, be careful in production!)
  // await prisma.car.deleteMany();
  // await prisma.option.deleteMany();

  // 1. Seed Options
  console.log('Seeding Options...');
  const options = [
  {
    "id": 6,
    "name": "Selbstbehalt-Ermäßigung",
    "description": null,
    "price": "8.640000000000001",
    "type": "insurance",
    "isPerDay": true,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:23:35.308Z",
    "updatedAt": "2026-02-11T18:23:35.308Z"
  },
  {
    "id": 7,
    "name": "Zusatzfahrer",
    "description": null,
    "price": "4.8",
    "type": "extra",
    "isPerDay": true,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:23:35.338Z",
    "updatedAt": "2026-02-11T18:23:35.338Z"
  },
  {
    "id": 8,
    "name": "Kindersitz (9–18 kg)",
    "description": null,
    "price": "4.8",
    "type": "extra",
    "isPerDay": true,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:23:35.369Z",
    "updatedAt": "2026-02-11T18:23:35.369Z"
  },
  {
    "id": 9,
    "name": "Kindersitzerhöhung (15–36 kg)",
    "description": null,
    "price": "2.4",
    "type": "extra",
    "isPerDay": true,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:23:35.399Z",
    "updatedAt": "2026-02-11T18:23:35.399Z"
  },
  {
    "id": 10,
    "name": "Mehrkilometer 200 Paket (Kleinwagen)",
    "description": null,
    "price": "50",
    "type": "package",
    "isPerDay": false,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:32:58.459Z",
    "updatedAt": "2026-02-11T18:32:58.459Z"
  },
  {
    "id": 11,
    "name": "Mehrkilometer 500 Paket (Kleinwagen)",
    "description": null,
    "price": "125",
    "type": "package",
    "isPerDay": false,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:32:58.555Z",
    "updatedAt": "2026-02-11T18:32:58.555Z"
  },
  {
    "id": 12,
    "name": "Mehrkilometer 900 Paket (Kleinwagen)",
    "description": null,
    "price": "225",
    "type": "package",
    "isPerDay": false,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:32:58.618Z",
    "updatedAt": "2026-02-11T18:32:58.618Z"
  },
  {
    "id": 13,
    "name": "Mehrkilometer 1500 Paket (Kleinwagen)",
    "description": null,
    "price": "375",
    "type": "package",
    "isPerDay": false,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:32:58.681Z",
    "updatedAt": "2026-02-11T18:32:58.681Z"
  },
  {
    "id": 18,
    "name": "Mehrkilometer 2000 km Paket",
    "description": null,
    "price": "519",
    "type": "package",
    "isPerDay": false,
    "maxPrice": null,
    "maxDays": null,
    "isMandatory": false,
    "maxQuantity": 1,
    "status": "active",
    "imageUrl": null,
    "createdAt": "2026-02-11T18:45:07.038Z",
    "updatedAt": "2026-02-11T18:45:07.038Z"
  }
];

  for (const option of options) {
    await prisma.option.upsert({
      where: { id: option.id },
      update: option,
      create: option,
    });
  }

  // 2. Seed Cars
  console.log('Seeding Cars...');
  const cars = [
  {
    "id": 20,
    "brand": "Peugeot",
    "model": "Traveller Automatic",
    "plate": "FK 990IU",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Automatik",
    "category": "Van",
    "doors": 4,
    "seats": 9,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479828966",
    "chassisNumber": null,
    "dailyRate": "75",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Peugeot Traveller Automatic.png",
    "images": null,
    "description": "Mieten Sie unseren komfortablen 9-Sitzer Peugeot Traveller Expert für Ihre nächste Reise oder Veranstaltung. Ideal für Gruppen von Freunden, Familien oder Geschäftsreisende.",
    "features": "9-Sitzer, Automatik, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:08.967Z",
    "updatedAt": "2026-02-11T20:01:46.294Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 26,
    "brand": "VW",
    "model": "Golf Kombi",
    "plate": "FK-891HY",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Kombi",
    "doors": 5,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829562",
    "chassisNumber": null,
    "dailyRate": "32.5",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/VW Golf Kombi.png",
    "images": null,
    "description": "Sie möchten einen wendigen Kombi in der Mittelklasse mieten? Kein Problem! Ein Fahrzeug dieser Kategorie ist die ideale Lösung – ob für eine Reise mit der Familie oder für geschäftliche Fahrten. Dank moderner Ausstattung und smarten Funktionen wird jede Fahrt noch komfortabler.",
    "features": "Mittelklasse Kombi, 100km/Tag inkl., Mehrkm: 0.36€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.563Z",
    "updatedAt": "2026-02-11T20:01:47.461Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 29,
    "brand": "Ford",
    "model": "Transit Custom L1",
    "plate": "FK818GT",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Bus",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829840",
    "chassisNumber": null,
    "dailyRate": "74",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 150,
    "imageUrl": "/assets/cars/Ford Transit Custom L1.png",
    "images": null,
    "description": "Der Ford Transit Custom 9-Sitzer kombiniert individuellen Stil, Qualität und Attraktivität mit außergewöhnlichem Komfort, schlankem Design und fortschrittlicher Technologie. Ideal für Familienausflüge, Gruppenreisen oder geschäftliche Fahrten.",
    "features": "9-Sitzer, 150km/Tag inkl., Mehrkm: 0.42€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.841Z",
    "updatedAt": "2026-02-11T20:01:48.137Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 28,
    "brand": "Ford",
    "model": "Transit Custom Langversion Automatik",
    "plate": "FK820GT",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Automatik",
    "category": "Bus",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829749",
    "chassisNumber": null,
    "dailyRate": "84",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 150,
    "imageUrl": "/assets/cars/Ford Transit Custom Langversion Automatik.png",
    "images": null,
    "description": "Der Ford Transit Custom 9-Sitzer Langversion mit Automatik kombiniert Stil, Qualität und Attraktivität mit außergewöhnlichem Komfort und moderner Technologie. Ideal für größere Gruppen, Familienausflüge oder geschäftliche Fahrten mit maximalem Komfort.",
    "features": "9-Sitzer, Langversion, Automatik, 150km/Tag inkl., Mehrkm: 0.42€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.750Z",
    "updatedAt": "2026-02-11T20:01:48.209Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 27,
    "brand": "Skoda",
    "model": "Superb Kombi",
    "plate": "FK944IU",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Automatik",
    "category": "Kombi",
    "doors": 5,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829653",
    "chassisNumber": null,
    "dailyRate": "48",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Skoda Superb Kombi.png",
    "images": null,
    "description": "Der Skoda Superb ist ein Fahrzeug der oberen Mittelklasse und überzeugt durch seine großzügige Raumgestaltung sowie hohen Komfort. Er bietet viel Platz, modernes Design und eignet sich sowohl für Geschäftsreisen als auch für längere Fahrten mit der Familie.",
    "features": "Obere Mittelklasse Kombi, Automatik, 100km/Tag inkl., Mehrkm: 0.45€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.654Z",
    "updatedAt": "2026-02-11T20:01:48.273Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 32,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK199HP",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK199HP-ZEFH5Y",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:21.312Z",
    "updatedAt": "2026-02-11T19:53:21.312Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 33,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK202HP",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK202HP-4VJ4ZV",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:21.859Z",
    "updatedAt": "2026-02-11T19:53:21.859Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 34,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK985HV",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK985HV-QA407D",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:22.114Z",
    "updatedAt": "2026-02-11T19:53:22.114Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 35,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK808HX",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK808HX-5O7ECH",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:23.184Z",
    "updatedAt": "2026-02-11T19:53:23.184Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 19,
    "brand": "Seat",
    "model": "Leon Kombi",
    "plate": "FK-497JC",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Benzin",
    "transmission": null,
    "category": "Kombi",
    "doors": null,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479828781",
    "chassisNumber": null,
    "dailyRate": "33.9",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Seat Leon Kombi.png",
    "images": null,
    "description": "Sie möchten einen wendigen Kombi in der Mittelklasse mieten? Der Seat Leon Kombi ist die ideale Lösung – ob für eine Reise mit der Familie oder für geschäftliche Fahrten. Dank moderner Ausstattung und smarten Funktionen wird jede Fahrt komfortabel und angenehm.",
    "features": "Mittelklasse Kombi, 100km/Tag inkl., Mehrkm: 0.36€, Kaskoschutz SB 1500€",
    "hasAirConditioning": false,
    "hasGPS": false,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": false,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:08.783Z",
    "updatedAt": "2026-02-11T20:01:46.173Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 21,
    "brand": "Ford",
    "model": "Mustang Mach-E GT",
    "plate": "FK 142IR",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Elektro",
    "transmission": "Automatik",
    "category": "SUV",
    "doors": null,
    "seats": null,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829057",
    "chassisNumber": null,
    "dailyRate": "54",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Ford Mustang Mach-E GT.png",
    "images": null,
    "description": "Der Ford Mustang Mach-E GT ist ein kraftvolles Elektro-SUV, das die Mustang-Tradition in die Elektromobilität überführt. Er bietet elegantes Design, moderne Technologie und hohen Komfort. Ausgestattet mit großem Touchscreen, App-Unterstützung zur Fernsteuerung und Routenplanung sowie umfassenden Sicherheitssystemen.",
    "features": "Elektro-SUV, Automatik, 100km/Tag inkl., Ladekarte inkl., Mehrkm: 0.45€, Kaskoschutz SB 1500€",
    "hasAirConditioning": false,
    "hasGPS": false,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": false,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": null,
    "homeLocationId": null,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.058Z",
    "updatedAt": "2026-02-11T20:01:46.382Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 25,
    "brand": "Opel",
    "model": "Corsa",
    "plate": "FK-07-OC",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Benzin",
    "transmission": null,
    "category": "Kleinwagen",
    "doors": null,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829419",
    "chassisNumber": null,
    "dailyRate": "30",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/OpelCorsa.png",
    "images": null,
    "description": "Ein Kleinwagen für den stilvollen Auftritt. Der Stadtflitzer bietet Platz und Komfort, ist aber dennoch wendig und agil. Mit einem Kleinwagen kommen Sie nahezu in jede Parklücke hinein.",
    "features": "Kleinwagen, 100km/Tag inkl., Mehrkm: 0.33€, Kaskoschutz SB 1500€",
    "hasAirConditioning": false,
    "hasGPS": false,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": false,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.420Z",
    "updatedAt": "2026-02-11T18:50:33.447Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 23,
    "brand": "Hyundai",
    "model": "Ioniq Elektro",
    "plate": "FK-194ID",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Elektro",
    "transmission": "Automatik",
    "category": "Mittelklasse",
    "doors": null,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829239",
    "chassisNumber": null,
    "dailyRate": "30",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Hyundai Ioniq Elektro.png",
    "images": null,
    "description": "Der Hyundai Ioniq Elektro ist ein sparsames und umweltfreundliches Fahrzeug mit moderner Technologie. Mit seiner Gesamtlänge von ca. 4,5 m bietet er trotz Kompaktklasse ausreichend Platz – auch für Familien mit Kindern. Dank mobiler Wallbox und Ladekabel kann das Fahrzeug flexibel geladen werden.",
    "features": "Elektro (38.3 kWh), Automatik, 100km/Tag inkl., Mobile Wallbox & Ladekabel inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": false,
    "hasGPS": false,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": false,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.240Z",
    "updatedAt": "2026-02-11T20:01:46.451Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 36,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK807HX",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK807HX-IKTV38",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:24.057Z",
    "updatedAt": "2026-02-11T19:53:24.057Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 37,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK806HX",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK806HX-LRM8T",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:24.463Z",
    "updatedAt": "2026-02-11T19:53:24.463Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 24,
    "brand": "VW",
    "model": "Polo",
    "plate": "FK-655IB",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Benzin",
    "transmission": null,
    "category": "Kleinwagen",
    "doors": null,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "SEED1770479829329",
    "chassisNumber": null,
    "dailyRate": "30",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/VWPolo.png",
    "images": null,
    "description": "Ein Kleinwagen für den stilvollen Auftritt. Der Stadtflitzer bietet Platz und Komfort, ist aber dennoch wendig und agil. Mit einem Kleinwagen kommen Sie nahezu in jede Parklücke hinein.",
    "features": "Kleinwagen, 100km/Tag inkl., Mehrkm: 0.33€, Kaskoschutz SB 1500€",
    "hasAirConditioning": false,
    "hasGPS": false,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": false,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-07T15:57:09.330Z",
    "updatedAt": "2026-02-11T20:01:46.521Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 38,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK568HY",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK568HY-03BGTB",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:24.694Z",
    "updatedAt": "2026-02-11T19:53:24.694Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 39,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK559HZ",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK559HZ-TWPIXE",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:24.894Z",
    "updatedAt": "2026-02-11T19:53:24.894Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 40,
    "brand": "Fiat",
    "model": "Ducato L3H2",
    "plate": "FK273IG",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK273IG-2FXW4K",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:53:25.091Z",
    "updatedAt": "2026-02-11T19:53:25.091Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 41,
    "brand": "Fiat",
    "model": "Ducato L4H2",
    "plate": "FK846II",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK846II-IAPOYI",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L4H2.png",
    "images": null,
    "description": "Der Fiat Ducato L4H2 ist ideal für den Transport von Fahrzeugen oder großen Möbeln wie Küchen-, Wohn- oder Schlafzimmermöbeln. Mit diesem Transporter können Sie Waren ausliefern oder alte Möbel zur Müllhalde bringen.",
    "features": "Ladevolumen 15 m³, 4.0m Laderaum, 100km/Tag inkl., Mehrkm: 0.24€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:54:51.968Z",
    "updatedAt": "2026-02-11T19:54:51.968Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 42,
    "brand": "Fiat",
    "model": "Ducato L4H2",
    "plate": "FK933IU",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK933IU-AFEDL",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L4H2.png",
    "images": null,
    "description": "Der Fiat Ducato L4H2 ist ideal für den Transport von Fahrzeugen oder großen Möbeln wie Küchen-, Wohn- oder Schlafzimmermöbeln. Mit diesem Transporter können Sie Waren ausliefern oder alte Möbel zur Müllhalde bringen.",
    "features": "Ladevolumen 15 m³, 4.0m Laderaum, 100km/Tag inkl., Mehrkm: 0.24€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:54:52.796Z",
    "updatedAt": "2026-02-11T19:54:52.796Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 43,
    "brand": "Fiat",
    "model": "Ducato L4H2",
    "plate": "FK934IU",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK934IU-BSYGLT",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L4H2.png",
    "images": null,
    "description": "Der Fiat Ducato L4H2 ist ideal für den Transport von Fahrzeugen oder großen Möbeln wie Küchen-, Wohn- oder Schlafzimmermöbeln. Mit diesem Transporter können Sie Waren ausliefern oder alte Möbel zur Müllhalde bringen.",
    "features": "Ladevolumen 15 m³, 4.0m Laderaum, 100km/Tag inkl., Mehrkm: 0.24€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T19:54:53.417Z",
    "updatedAt": "2026-02-11T19:54:53.417Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 44,
    "brand": "VW",
    "model": "Golf Kombi",
    "plate": "FK-447IL",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Kombi",
    "doors": 5,
    "seats": 5,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK-447IL-VGE9CG",
    "chassisNumber": null,
    "dailyRate": "32.5",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/VW Golf Kombi.png",
    "images": null,
    "description": "Sie möchten einen wendigen Kombi in der Mittelklasse mieten? Kein Problem! Ein Fahrzeug dieser Kategorie ist die ideale Lösung – ob für eine Reise mit der Familie oder für geschäftliche Fahrten. Dank moderner Ausstattung und smarten Funktionen wird jede Fahrt noch komfortabler.",
    "features": "Mittelklasse Kombi, 100km/Tag inkl., Mehrkm: 0.36€, Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T20:01:47.503Z",
    "updatedAt": "2026-02-11T20:01:47.503Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 45,
    "brand": "Fiat",
    "model": "Ducato L3H2 Plus",
    "plate": "FK845II",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK845II-SDCE0A",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T20:01:48.443Z",
    "updatedAt": "2026-02-11T20:01:48.443Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 46,
    "brand": "Fiat",
    "model": "Ducato L3H2 Plus",
    "plate": "FK850II",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK850II-YMNUB",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T20:01:48.660Z",
    "updatedAt": "2026-02-11T20:01:48.660Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 47,
    "brand": "Fiat",
    "model": "Ducato L3H2 Plus",
    "plate": "FK851II",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK851II-VAFG2D",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T20:01:48.850Z",
    "updatedAt": "2026-02-11T20:01:48.850Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  },
  {
    "id": 48,
    "brand": "Fiat",
    "model": "Ducato L3H2 Plus",
    "plate": "FK852II",
    "year": 2025,
    "color": "Weiß",
    "fuelType": "Diesel",
    "transmission": "Manuell",
    "category": "Transporter",
    "doors": 4,
    "seats": 3,
    "engineSize": null,
    "horsePower": null,
    "fuelConsumption": null,
    "co2Emission": null,
    "status": "Active",
    "vin": "VIN-FK852II-UI8NTB",
    "chassisNumber": null,
    "dailyRate": "59",
    "weeklyRate": null,
    "monthlyRate": null,
    "longTermRate": null,
    "minDaysForLongTerm": null,
    "depositAmount": "1500",
    "promoPrice": null,
    "promoStartDate": null,
    "promoEndDate": null,
    "insuranceCompany": null,
    "insurancePolicyNumber": null,
    "insuranceValidUntil": null,
    "registrationDate": null,
    "nextInspection": null,
    "currentMileage": null,
    "purchaseMileage": null,
    "maxMileagePerDay": 100,
    "imageUrl": "/assets/cars/Fiat Ducato L3H2.png",
    "images": null,
    "description": "Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.",
    "features": "Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€",
    "hasAirConditioning": true,
    "hasGPS": true,
    "hasHeatedSeats": false,
    "hasParkingSensors": false,
    "hasBackupCamera": false,
    "hasCruiseControl": false,
    "hasBluetoothAudio": true,
    "hasUSBPorts": false,
    "hasChildSeatAnchors": false,
    "hasSkiRack": false,
    "hasTowHitch": false,
    "vignetteValidUntil": null,
    "vignetteType": null,
    "lastOilChange": null,
    "nextOilChange": null,
    "lastTireChange": null,
    "tireType": null,
    "nextServiceDate": null,
    "lastServiceDate": null,
    "locationId": 1,
    "homeLocationId": 1,
    "purchasePrice": null,
    "purchaseDate": null,
    "currentValue": null,
    "internalNotes": null,
    "damageHistory": null,
    "isActive": true,
    "latitude": null,
    "longitude": null,
    "createdAt": "2026-02-11T20:01:50.052Z",
    "updatedAt": "2026-02-11T20:01:50.052Z",
    "options": [
      {
        "id": 6
      },
      {
        "id": 7
      },
      {
        "id": 8
      },
      {
        "id": 9
      },
      {
        "id": 10
      },
      {
        "id": 11
      },
      {
        "id": 12
      },
      {
        "id": 13
      },
      {
        "id": 18
      }
    ]
  }
];

  for (const car of cars) {
    // Separate options relation for processing
    const { options: carOptionRelations, ...carData } = car;
    
    // Create/Upsert car
    await prisma.car.upsert({
      where: { id: car.id },
      update: {
        ...carData,
        options: {
          set: carOptionRelations.map((o: { id: number }) => ({ id: o.id }))
        }
      },
      create: {
        ...carData,
        options: {
          connect: carOptionRelations.map((o: { id: number }) => ({ id: o.id }))
        }
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
