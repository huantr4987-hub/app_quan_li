import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

export function useFishingApp() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({
    fishBuybackName: 'Cá chung',
    fishBuybackPrice: 20000,
    defaultPondPrice: 30000,
  });

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Sync (when user is logged in)
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setProducts([]);
      setCustomers([]);
      return;
    }

    const uid = user.uid;

    // Sync Sessions
    const qSessions = query(collection(db, 'sessions'), where('ownerId', '==', uid));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setSessions(data);
      // Calculate revenue from completed sessions
      const totalRevenue = data
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.finalTotal || 0), 0);
      setRevenue(totalRevenue);
    });

    // Sync Products
    const qProducts = query(collection(db, 'products'), where('ownerId', '==', uid));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      if (data.length === 0) {
        // Initial products if empty
        const initialProducts = [
          { name: 'Nước suối', price: 10000, category: 'drink', ownerId: uid },
          { name: 'Bò húc', price: 15000, category: 'drink', ownerId: uid },
          { name: 'Mì tôm trứng', price: 20000, category: 'food', ownerId: uid },
          { name: 'Mồi cá lóc', price: 30000, category: 'bait', ownerId: uid },
        ];
        initialProducts.forEach(p => addProduct(p));
      } else {
        setProducts(data);
      }
    });

    // Sync Customers
    const qCustomers = query(collection(db, 'customers'), where('ownerId', '==', uid));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // Sync Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', uid), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        // Create default settings if not exists
        const defaultSettings = {
          fishBuybackName: 'Cá chung',
          fishBuybackPrice: 20000,
          defaultPondPrice: 30000,
          ownerId: uid
        };
        setDoc(doc(db, 'settings', uid), defaultSettings);
      }
    });

    return () => {
      unsubSessions();
      unsubProducts();
      unsubCustomers();
      unsubSettings();
    };
  }, [user]);

  const login = (userData) => {
    // handled by onAuthStateChanged
  };

  const logout = async () => {
    await auth.signOut();
  };

  // --- Session Management ---
  const createSession = async (sessionData) => {
    const newSession = {
      ...sessionData,
      ownerId: user.uid,
      status: 'active',
      startTime: Date.now(),
      additionalFees: 0,
      fishWeight: 0,
      fishSoldBack: 0,
      foodItems: [],
      addedTime: 0,
    };
    const docRef = doc(collection(db, 'sessions'));
    await setDoc(docRef, newSession);
    return { ...newSession, id: docRef.id };
  };

  const updateSession = async (id, updates) => {
    await updateDoc(doc(db, 'sessions', id), updates);
  };

  const completeSession = async (id, finalAmount) => {
    await updateDoc(doc(db, 'sessions', id), {
      status: 'completed',
      endTime: Date.now(),
      finalTotal: finalAmount
    });
  };

  // --- Product Management ---
  const addProduct = async (product) => {
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, { ...product, ownerId: user.uid });
  };

  const updateProduct = async (id, updates) => {
    await updateDoc(doc(db, 'products', id), updates);
  };

  const removeProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  // --- Customer Management ---
  const saveCustomer = async (customerData) => {
    const existing = customers.find(c => c.phone === customerData.phone);
    if (existing) {
      await updateDoc(doc(db, 'customers', existing.id), { name: customerData.name });
      return existing.id;
    } else {
      const docRef = doc(collection(db, 'customers'));
      await setDoc(docRef, { ...customerData, ownerId: user.uid });
      return docRef.id;
    }
  };

  // --- Settings Management ---
  const updateSettings = async (newSettings) => {
    await setDoc(doc(db, 'settings', user.uid), { ...newSettings, ownerId: user.uid });
  };

  return {
    user,
    sessions,
    revenue,
    products,
    customers,
    settings,
    login,
    logout,
    createSession,
    updateSession,
    completeSession,
    addProduct,
    updateProduct,
    removeProduct,
    saveCustomer,
    updateSettings
  };
}
