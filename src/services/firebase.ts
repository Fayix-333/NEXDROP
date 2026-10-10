import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Order, Review } from '../types';

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate connection per Firebase Skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice:', error.message);
    }
  }
}
testConnection();

/**
 * Persists and updates user profile, PIN code, contact phone number and addresses in Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    const primaryAddress = user.addresses?.[0];
    const pinCode = primaryAddress?.pin_code || '682001';

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || primaryAddress?.phone || '',
      pin_code: pinCode,
      district: user.default_district || primaryAddress?.district || 'Ernakulam',
      role: user.role,
      addresses: user.addresses || [],
      wishlist: user.wishlist || [],
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }
}

/**
 * Fetches user profile from Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<Partial<User> | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<User>;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user from Firestore:', err);
    return null;
  }
}

/**
 * Persists an order to Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      pin_code: order.shipping_address?.pin_code || '',
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error persisting order to Firestore:', err);
  }
}

/**
 * Updates order tracking status in Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  shipping_status: Order['shipping_status'],
  tracking_timeline: Order['tracking_timeline'],
  rejection_reason?: string
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: Record<string, any> = {
      shipping_status,
      tracking_timeline,
      updated_at: new Date().toISOString(),
    };
    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }
    await setDoc(orderRef, updateData, { merge: true });
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
  }
}

/**
 * Real-time order listener for customer dashboard
 */
export function listenToCustomerOrders(
  customerId: string,
  onOrdersUpdated: (orders: Order[]) => void
): () => void {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('customer_id', '==', customerId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Order);
          });
          // Sort descending by created_at
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          onOrdersUpdated(list);
        }
      },
      (err) => {
        console.warn('Firestore live order listener warning:', err.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach live orders listener:', err);
    return () => {};
  }
}

/**
 * Persists a product review to Firestore
 */
export async function saveReviewToFirestore(review: Review): Promise<void> {
  try {
    const revRef = doc(db, 'reviews', review.id);
    await setDoc(revRef, review, { merge: true });
  } catch (err) {
    console.error('Error persisting review to Firestore:', err);
  }
}

/**
 * Real-time review listener for a specific product
 */
export function listenToProductReviews(
  productId: string,
  onReviewsUpdated: (reviews: Review[]) => void
): () => void {
  try {
    const revCol = collection(db, 'reviews');
    const q = query(revCol, where('product_id', '==', productId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Review[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Review);
          });
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          onReviewsUpdated(list);
        }
      },
      (err) => {
        console.warn('Firestore reviews listener warning:', err.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach live reviews listener:', err);
    return () => {};
  }
}
