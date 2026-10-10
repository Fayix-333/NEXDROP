export type UserRole = 'customer' | 'seller' | 'admin';

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  district: string;
  pin_code: string;
  is_default: boolean;
  type: 'Home' | 'Work';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: Address[];
  default_district: string;
  wishlist: string[]; // product IDs
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price_override?: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  title_ml: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  original_price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  stock: number;
  seller_id: string;
  seller_name: string;
  seller_district: string;
  seller_verified: boolean;
  images: string[];
  description: string;
  description_ml: string;
  features: string[];
  specs: Record<string, string>;
  is_kerala_special: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  is_active: boolean;
  variants?: ProductVariant[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ml: string;
  icon: string;
  description: string;
  product_count: number;
}

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  product: Product;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Dispatched'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancellation Requested'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay_upi' | 'razorpay_card' | 'netbanking' | 'cod';

export interface TrackingEvent {
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  delivery_charge: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_transaction_id: string;
  shipping_status: OrderStatus;
  shipping_carrier: string;
  awb_number: string;
  shipping_address: Address;
  tracking_timeline: TrackingEvent[];
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  district: string;
  gstin: string;
  pan: string;
  bank_name: string;
  account_number: string;
  ifsc: string;
  is_approved: boolean;
  commission_rate: number; // e.g. 10 for 10%
  total_sales: number;
  total_orders: number;
  active_products: number;
  created_at: string;
}

export interface DeliveryPinCode {
  pin_code: string;
  district: string;
  area_name: string;
  is_serviceable: boolean;
  standard_delivery_fee: number;
  express_available: boolean;
  express_delivery_fee: number;
  cod_allowed: boolean;
  min_free_delivery_threshold: number;
  estimated_days: number;
}

export interface Coupon {
  code: string;
  description: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  is_active: boolean;
  expiry_date: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_district: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  helpful_votes: number;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  order_id?: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: string;
}
