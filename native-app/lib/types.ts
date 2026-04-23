export interface Car {
  id: number;
  brand: string;
  model: string;
  category: string | null;
  dailyRate: string | number;
  imageUrl: string | null;
  fuelType: string;
  transmission: string | null;
  year?: number | null;
  seats?: number | null;
  doors?: number | null;
  licensePlate?: string | null;
  plate?: string | null;
  description?: string | null;
  features?: string[] | null;
  status?: string | null;
  currentMileage?: number | null;
  nextInspection?: string | null;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'MANAGER' | 'AGENT' | 'DRIVER' | string;
  locationId?: number | null;
  locationName?: string | null;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Active'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded' | 'Failed' | 'Pending' | 'Partial';

export interface Booking {
  id: number;
  carId: number;
  car?: Car;
  customerId: number;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number | string;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  createdAt: string;
}

export interface AdminRental {
  id: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  startDate: string;
  endDate: string;
  totalAmount: string;
  isOverdue: boolean;
  contractNumber: string | null;
  car: {
    id: number;
    brand: string;
    model: string;
    plate: string;
    imageUrl: string | null;
  } | null;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface AdminRentalDetail extends AdminRental {
  actualReturnDate: string | null;
  pickupMileage: number | null;
  returnMileage: number | null;
  dailyRate: string;
  totalDays: number;
  notes: string | null;
  pickupLocation: string | null;
  returnLocation: string | null;
  customer: AdminRental['customer'] & { licenseNumber?: string | null };
}

export interface AdminDashboard {
  cars: { total: number; active: number; maintenance: number };
  rentals: {
    active: number;
    pending: number;
    overdue: number;
    todayPickups: number;
    todayReturns: number;
    monthCount: number;
  };
  revenue: { month: number };
}

export interface AdminCar {
  id: number;
  brand: string;
  model: string;
  plate: string;
  year: number;
  status: string;
  category: string | null;
  fuelType: string;
  dailyRate: string;
  imageUrl: string | null;
  currentMileage: number | null;
  nextInspection: string | null;
}

export interface AdminCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  isBlacklisted: boolean;
  customerType: string | null;
  rentalCount: number;
  createdAt: string;
}

export interface AdminActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  userId: string | null;
  userName: string | null;
  description: string;
  metadata: string | null;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  customer: Customer;
}

export interface StaffSession {
  token: string;
  staff: Staff;
}

export interface Location {
  id: number;
  name: string;
  city: string;
  address: string | null;
  code?: string | null;
}
