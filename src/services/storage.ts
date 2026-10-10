import {
  Product,
  Category,
  Seller,
  DeliveryPinCode,
  Coupon,
  Order,
  Review,
  User,
  CartItem,
  Address,
  OrderStatus,
  PaymentMethod,
  RefundRequest,
  SellerPayout,
  NotificationItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_PIN_CODES,
  INITIAL_SELLERS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_USER,
  INITIAL_CUSTOMERS,
  INITIAL_REFUNDS,
  INITIAL_PAYOUTS,
} from '../data/mockData';
import { lookupKeralaPincodeSync } from './keralaPincode';
import {
  saveUserToFirestore,
  saveOrderToFirestore,
  saveReviewToFirestore,
  updateOrderStatusInFirestore,
} from './firebase';

const PREFIX = 'nexdrop_v1_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.warn(`Error reading key ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing key ${key} to localStorage:`, err);
  }
}

export class NexdropStore {
  // Products
  static getProducts(): Product[] {
    return getStored<Product[]>('products', INITIAL_PRODUCTS);
  }

  static saveProducts(products: Product[]): void {
    setStored('products', products);
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  static addProduct(product: Omit<Product, 'id' | 'created_at'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `nx_prod_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(product: Product): void {
    const products = this.getProducts().map((p) => (p.id === product.id ? product : p));
    this.saveProducts(products);
  }

  // Categories
  static getCategories(): Category[] {
    return getStored<Category[]>('categories', INITIAL_CATEGORIES);
  }

  // PIN Codes
  static getPinCodes(): DeliveryPinCode[] {
    return getStored<DeliveryPinCode[]>('pincodes', INITIAL_PIN_CODES);
  }

  static savePinCodes(pins: DeliveryPinCode[]): void {
    setStored('pincodes', pins);
  }

  static checkPinServiceability(pin: string): {
    serviceable: boolean;
    info?: DeliveryPinCode;
    message: string;
  } {
    const cleaned = pin.trim();
    if (!/^\d{6}$/.test(cleaned)) {
      return { serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code.' };
    }
    const match = this.getPinCodes().find((p) => p.pin_code === cleaned);
    if (!match) {
      // Automatic Kerala PIN & Place Resolution
      const placeLookup = lookupKeralaPincodeSync(cleaned);
      if (placeLookup && placeLookup.isKerala) {
        return {
          serviceable: true,
          info: {
            pin_code: cleaned,
            district: placeLookup.district,
            area_name: placeLookup.placeName,
            is_serviceable: true,
            standard_delivery_fee: placeLookup.standardFee,
            express_available: placeLookup.expressAvailable,
            express_delivery_fee: placeLookup.expressFee,
            cod_allowed: placeLookup.codAvailable,
            min_free_delivery_threshold: placeLookup.freeDeliveryThreshold,
            estimated_days: placeLookup.estimatedDays,
          },
          message: `Identified: ${placeLookup.placeName}, ${placeLookup.district} (${placeLookup.deliverySpeed} Delivery).`,
        };
      }
      return {
        serviceable: false,
        message: 'Currently delivery is focused across Kerala PIN codes (670xxx - 695xxx).',
      };
    }
    if (!match.is_serviceable) {
      return {
        serviceable: false,
        info: match,
        message: `Delivery temporarily suspended in ${match.area_name} (${match.district}).`,
      };
    }
    return {
      serviceable: true,
      info: match,
      message: `Delivering to ${match.area_name}, ${match.district} in ${match.estimated_days} ${match.estimated_days === 1 ? 'day' : 'days'}.`,
    };
  }

  // Sellers
  static getSellers(): Seller[] {
    return getStored<Seller[]>('sellers', INITIAL_SELLERS);
  }

  static saveSellers(sellers: Seller[]): void {
    setStored('sellers', sellers);
  }

  static registerSeller(seller: Omit<Seller, 'id' | 'is_approved' | 'total_sales' | 'total_orders' | 'active_products' | 'created_at'>): Seller {
    const sellers = this.getSellers();
    const newSeller: Seller = {
      ...seller,
      id: `seller_${Date.now()}`,
      is_approved: false,
      total_sales: 0,
      total_orders: 0,
      active_products: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    sellers.unshift(newSeller);
    this.saveSellers(sellers);
    return newSeller;
  }

  static toggleSellerApproval(sellerId: string): void {
    const sellers = this.getSellers().map((s) =>
      s.id === sellerId ? { ...s, is_approved: !s.is_approved } : s
    );
    this.saveSellers(sellers);
  }

  // Coupons
  static getCoupons(): Coupon[] {
    return getStored<Coupon[]>('coupons', INITIAL_COUPONS);
  }

  static saveCoupons(coupons: Coupon[]): void {
    setStored('coupons', coupons);
  }

  static validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }
    if (subtotal < coupon.min_order_amount) {
      return {
        valid: false,
        discount: 0,
        message: `Order subtotal must be at least ₹${coupon.min_order_amount} for this coupon.`,
      };
    }
    let discount = 0;
    if (coupon.discount_type === 'flat') {
      discount = coupon.discount_value;
    } else {
      discount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    }
    return {
      valid: true,
      discount,
      message: `Coupon ${coupon.code} applied! Saved ₹${discount}.`,
      coupon,
    };
  }

  // Orders
  static getOrders(): Order[] {
    return getStored<Order[]>('orders', INITIAL_ORDERS);
  }

  static saveOrders(orders: Order[]): void {
    setStored('orders', orders);
  }

  static createOrder(params: {
    customer: User;
    items: CartItem[];
    shipping_address: Address;
    delivery_charge: number;
    coupon_code?: string;
    discount_amount: number;
    payment_method: PaymentMethod;
    is_express?: boolean;
  }): Order {
    const orders = this.getOrders();
    const subtotal = params.items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    // Kerala GST breakdown: 9% CGST + 9% SGST = 18% total
    const tax_amount = Math.round(subtotal * 0.18);
    const total_amount = Math.max(0, subtotal + tax_amount + params.delivery_charge - params.discount_amount);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const order_number = `NXD-KL-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      order_number,
      customer_id: params.customer.id,
      customer_name: params.customer.name,
      customer_phone: params.shipping_address.phone || params.customer.phone,
      customer_email: params.customer.email,
      items: params.items,
      subtotal,
      tax_amount,
      delivery_charge: params.delivery_charge,
      discount_amount: params.discount_amount,
      coupon_code: params.coupon_code,
      total_amount,
      payment_method: params.payment_method,
      payment_status: params.payment_method === 'cod' ? 'pending' : 'completed',
      payment_transaction_id: params.payment_method === 'cod' ? `COD_${randomSuffix}` : `pay_RAZOR_${Date.now()}`,
      shipping_status: 'Payment Confirmed',
      shipping_carrier: params.is_express ? 'Kerala Express Priority 24h' : 'Kerala Speed Logistics',
      awb_number: `KL-AWB-${Date.now().toString().slice(-8)}`,
      shipping_address: params.shipping_address,
      tracking_timeline: [
        {
          title: 'Order Placed & Verified',
          description: params.payment_method === 'cod' ? 'Cash on Delivery verified for Kerala PIN.' : 'Payment confirmed via secure Razorpay gateway.',
          location: `${params.shipping_address.district} Zone`,
          timestamp: 'Just now',
          completed: true,
        },
        {
          title: 'Processing at Fulfillment Center',
          description: 'Items allocated and dispatched to packing bay.',
          location: 'Kochi Central Hub (Aluva)',
          timestamp: 'Pending',
          completed: false,
        },
        {
          title: 'Handed to Delivery Courier',
          description: 'Shipment handed to route rider for transit.',
          location: `${params.shipping_address.district} Regional Delivery Hub`,
          timestamp: 'Estimated in 24 hrs',
          completed: false,
        },
        {
          title: 'Delivered',
          description: 'Package delivered to customer address.',
          location: params.shipping_address.street,
          timestamp: 'Estimated 2-3 days',
          completed: false,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    saveOrderToFirestore(newOrder);

    // Update stock & seller stats
    const products = this.getProducts();
    const sellers = this.getSellers();
    params.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        const seller = sellers.find((s) => s.id === prod.seller_id);
        if (seller) {
          seller.total_sales += prod.price * item.quantity;
          seller.total_orders += 1;
        }
      }
    });
    this.saveProducts(products);
    this.saveSellers(sellers);

    return newOrder;
  }

  static updateOrderStatus(orderId: string, status: OrderStatus, locationNote?: string): void {
    let changedOrder: Order | null = null;
    const orders = this.getOrders().map((ord) => {
      if (ord.id === orderId) {
        const updated = { ...ord, shipping_status: status, updated_at: new Date().toISOString() };
        if (locationNote) {
          updated.tracking_timeline.push({
            title: status,
            description: locationNote,
            location: ord.shipping_address.district,
            timestamp: 'Just updated',
            completed: true,
          });
        }
        changedOrder = updated;
        return updated;
      }
      return ord;
    });
    this.saveOrders(orders);
    if (changedOrder) {
      saveOrderToFirestore(changedOrder);
    }
  }

  // Reviews
  static getReviews(): Review[] {
    return getStored<Review[]>('reviews', INITIAL_REVIEWS);
  }

  static addReview(review: Omit<Review, 'id' | 'created_at' | 'helpful_votes'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      helpful_votes: 0,
    };
    reviews.unshift(newReview);
    setStored('reviews', reviews);
    saveReviewToFirestore(newReview);

    // Update product rating & review count
    const products = this.getProducts();
    const productReviews = reviews.filter((r) => r.product_id === review.product_id);
    const prod = products.find((p) => p.id === review.product_id);
    if (prod) {
      prod.review_count = productReviews.length;
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      prod.rating = Number((sum / productReviews.length).toFixed(1));
      this.saveProducts(products);
    }
    return newReview;
  }

  // Current User State
  static isCustomerLoggedIn(): boolean {
    return getStored<boolean>('customer_logged_in', false);
  }

  static setCustomerLoggedIn(status: boolean): void {
    setStored('customer_logged_in', status);
  }

  static logoutCustomer(): void {
    setStored('customer_logged_in', false);
  }

  static getUser(): User {
    const u = getStored<User>('user', INITIAL_USER);
    if (u) {
      let modified = false;
      if (u.name === 'Fayiz Mohammed' || !u.name) {
        u.name = 'Kerala Shopper';
        modified = true;
      }
      if (u.phone === '+91 98470 55432' || !u.phone) {
        u.phone = '+91 9037538732';
        modified = true;
      }
      if (u.email === 'mohammedfayizofficial@gmail.com' || u.email === 'fayiz.kerala@example.com') {
        u.email = 'nexdropkerala@gmail.com';
        modified = true;
      }
      if (u.addresses) {
        u.addresses.forEach((addr) => {
          if (addr.name === 'Fayiz Mohammed') {
            addr.name = 'Kerala Shopper';
            modified = true;
          }
          if (addr.phone === '+91 98470 55432' || !addr.phone) {
            addr.phone = '+91 9037538732';
            modified = true;
          }
        });
      }
      if (modified) {
        setStored('user', u);
      }
    }
    return u;
  }

  static saveUser(user: User): void {
    setStored('user', user);
    saveUserToFirestore(user);
  }

  static toggleWishlist(productId: string): string[] {
    const user = this.getUser();
    const exists = user.wishlist.includes(productId);
    const updated = exists ? user.wishlist.filter((id) => id !== productId) : [...user.wishlist, productId];
    user.wishlist = updated;
    this.saveUser(user);
    return updated;
  }

  // Cart
  static getCart(): CartItem[] {
    return getStored<CartItem[]>('cart', [
      {
        product_id: 'nx_prod_earbuds',
        quantity: 1,
        product: INITIAL_PRODUCTS[0],
      },
    ]);
  }

  static saveCart(cart: CartItem[]): void {
    setStored('cart', cart);
  }

  static addToCart(product: Product, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.product_id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        quantity,
        product,
      });
    }
    this.saveCart(cart);
    return cart;
  }

  static updateCartQty(productId: string, quantity: number): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter((item) => item.product_id !== productId);
    } else {
      const target = cart.find((item) => item.product_id === productId);
      if (target) {
        target.quantity = quantity;
      }
    }
    this.saveCart(cart);
    return cart;
  }

  static clearCart(): void {
    this.saveCart([]);
  }

  // Customer Accounts & Auth
  static getCustomers(): User[] {
    return getStored<User[]>('customers', INITIAL_CUSTOMERS);
  }

  static saveCustomers(customers: User[]): void {
    setStored('customers', customers);
  }

  static registerCustomer(data: { name: string; email: string; phone: string; district: string; pin_code?: string }): User {
    const customers = this.getCustomers();
    const pin = data.pin_code && /^\d{6}$/.test(data.pin_code.trim()) ? data.pin_code.trim() : '682001';
    const newUser: User = {
      id: `user_cust_${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: 'customer',
      default_district: data.district,
      wishlist: [],
      created_at: new Date().toISOString().split('T')[0],
      addresses: [
        {
          id: `addr_${Date.now()}`,
          name: data.name,
          phone: data.phone,
          street: `${data.district} Central`,
          district: data.district,
          pin_code: pin,
          is_default: true,
          type: 'Home',
        },
      ],
    };
    customers.unshift(newUser);
    this.saveCustomers(customers);
    this.saveUser(newUser);
    return newUser;
  }

  static loginCustomer(email: string): User | null {
    const customers = this.getCustomers();
    const found = customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      this.setCustomerLoggedIn(true);
      this.saveUser(found);
      return found;
    }
    return null;
  }

  static loginCustomerByPhone(phone: string, optionalName?: string): User {
    const rawClean = phone.replace(/\D/g, '');
    const cleanPhone = rawClean.length > 10 ? rawClean.slice(-10) : rawClean;
    const formatted = `+91 ${cleanPhone}`;

    const customers = this.getCustomers();
    let found = customers.find((c) => {
      const cClean = (c.phone || '').replace(/\D/g, '');
      const addrCleanMatch = c.addresses?.some((a) => (a.phone || '').replace(/\D/g, '').endsWith(cleanPhone));
      return cClean.endsWith(cleanPhone) || addrCleanMatch;
    });

    if (found) {
      if (optionalName && optionalName.trim() && found.name === 'Kerala Shopper') {
        found.name = optionalName.trim();
        this.saveCustomers(customers.map((c) => (c.id === found!.id ? found! : c)));
      }
      this.setCustomerLoggedIn(true);
      this.saveUser(found);
      return found;
    }

    // Auto-register customer with verified mobile number
    const newUser = this.registerCustomer({
      name: optionalName?.trim() || `Customer +91 ${cleanPhone}`,
      email: `customer_${cleanPhone}@nexdropkerala.in`,
      phone: formatted,
      district: 'Ernakulam',
      pin_code: '682001',
    });
    this.setCustomerLoggedIn(true);
    return newUser;
  }

  static toggleBlockCustomer(userId: string): void {
    const customers = this.getCustomers().map((c) =>
      c.id === userId ? { ...c, is_blocked: !c.is_blocked } : c
    );
    this.saveCustomers(customers);
  }

  // Seller Profile & Order Status
  static updateSellerShopProfile(sellerId: string, updates: Partial<Seller>): Seller {
    const sellers = this.getSellers();
    const updated = sellers.map((s) => (s.id === sellerId ? { ...s, ...updates } : s));
    this.saveSellers(updated);
    return updated.find((s) => s.id === sellerId)!;
  }

  static setSellerOrderStatus(orderId: string, status: OrderStatus, reason?: string): void {
    let targetOrder: Order | null = null;
    const orders = this.getOrders().map((ord) => {
      if (ord.id === orderId) {
        const upd: Order = {
          ...ord,
          shipping_status: status,
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
          tracking_timeline: [
            ...ord.tracking_timeline,
            {
              title: status,
              description: reason || `Order status updated to ${status} by merchant.`,
              location: ord.shipping_address.district,
              timestamp: 'Just now',
              completed: true,
            },
          ],
        };
        targetOrder = upd;
        return upd;
      }
      return ord;
    });
    this.saveOrders(orders);
    if (targetOrder) {
      saveOrderToFirestore(targetOrder);
    }
  }

  // Refunds & Returns
  static getRefunds(): RefundRequest[] {
    return getStored<RefundRequest[]>('refunds', INITIAL_REFUNDS);
  }

  static saveRefunds(refunds: RefundRequest[]): void {
    setStored('refunds', refunds);
  }

  static createRefundRequest(params: {
    order_id: string;
    order_number: string;
    customer_id: string;
    customer_name: string;
    seller_id: string;
    amount: number;
    reason: string;
  }): RefundRequest {
    const refunds = this.getRefunds();
    const newRefund: RefundRequest = {
      id: `ref_${Date.now()}`,
      ...params,
      status: 'Pending',
      created_at: new Date().toISOString().split('T')[0],
    };
    refunds.unshift(newRefund);
    this.saveRefunds(refunds);
    return newRefund;
  }

  static updateRefundStatus(refundId: string, status: 'Approved' | 'Rejected' | 'Refunded', notes?: string): void {
    const refunds = this.getRefunds().map((r) =>
      r.id === refundId ? { ...r, status, admin_notes: notes } : r
    );
    this.saveRefunds(refunds);
  }

  // Payouts
  static getPayouts(): SellerPayout[] {
    return getStored<SellerPayout[]>('payouts', INITIAL_PAYOUTS);
  }

  static savePayouts(payouts: SellerPayout[]): void {
    setStored('payouts', payouts);
  }

  static requestPayout(sellerId: string, sellerName: string, amount: number, commissionDeducted: number, bankDetails: string): SellerPayout {
    const payouts = this.getPayouts();
    const newPayout: SellerPayout = {
      id: `payout_${Date.now()}`,
      seller_id: sellerId,
      seller_name: sellerName,
      amount,
      commission_deducted: commissionDeducted,
      status: 'Pending',
      bank_details: bankDetails,
      created_at: new Date().toISOString().split('T')[0],
    };
    payouts.unshift(newPayout);
    this.savePayouts(payouts);
    return newPayout;
  }

  static processPayout(payoutId: string, utrNumber: string): void {
    const payouts = this.getPayouts().map((p) =>
      p.id === payoutId ? { ...p, status: 'Processed' as const, utr_number: utrNumber } : p
    );
    this.savePayouts(payouts);
  }

  // Product Moderation / Approval
  static approveProduct(productId: string): void {
    const products = this.getProducts().map((p) =>
      p.id === productId ? { ...p, approval_status: 'approved' as const, is_active: true } : p
    );
    this.saveProducts(products);
  }

  static rejectProduct(productId: string, notes?: string): void {
    const products = this.getProducts().map((p) =>
      p.id === productId ? { ...p, approval_status: 'rejected' as const, moderation_notes: notes, is_active: false } : p
    );
    this.saveProducts(products);
  }

  // Category Commission settings
  static updateCategoryCommission(categoryId: string, percent: number): void {
    const categories = this.getCategories().map((c) =>
      c.id === categoryId ? { ...c, commission_percent: percent } : c
    );
    setStored('categories', categories);
  }
}
