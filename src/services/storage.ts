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
} from '../data/mockData';

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
      // General Kerala PIN heuristic (670xxx - 695xxx)
      const num = parseInt(cleaned, 10);
      if (num >= 670000 && num <= 695999) {
        return {
          serviceable: true,
          info: {
            pin_code: cleaned,
            district: 'Kerala (Standard Region)',
            area_name: 'Standard Kerala Hub',
            is_serviceable: true,
            standard_delivery_fee: 55,
            express_available: false,
            express_delivery_fee: 120,
            cod_allowed: true,
            min_free_delivery_threshold: 699,
            estimated_days: 3,
          },
          message: 'Serviceable via Kerala Standard Surface Logistics (2-3 days).',
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
        return updated;
      }
      return ord;
    });
    this.saveOrders(orders);
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
  static getUser(): User {
    return getStored<User>('user', INITIAL_USER);
  }

  static saveUser(user: User): void {
    setStored('user', user);
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
}
