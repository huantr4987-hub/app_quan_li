import { useState, useEffect } from 'react';

export function useFishingApp() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [revenue, setRevenue] = useState(0);
  
  // New states
  const [products, setProducts] = useState([
    { id: 'p1', name: 'Nước suối', price: 10000, category: 'drink' },
    { id: 'p2', name: 'Bò húc', price: 15000, category: 'drink' },
    { id: 'p3', name: 'Mì tôm trứng', price: 20000, category: 'food' },
    { id: 'p4', name: 'Mồi cá lóc', price: 30000, category: 'bait' },
  ]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({
    fishBuybackName: 'Cá chung', // default fish name
    fishBuybackPrice: 20000, // 20k/kg default
    defaultPondPrice: 30000, // 30k/h default
  });

  // Load from local storage
  useEffect(() => {
    const loadState = (key, setter) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
    };

    loadState('fishing_user', setUser);
    loadState('fishing_sessions', setSessions);
    loadState('fishing_revenue', setRevenue);
    loadState('fishing_products', setProducts);
    loadState('fishing_customers', setCustomers);
    loadState('fishing_settings', setSettings);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => { localStorage.setItem('fishing_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('fishing_revenue', JSON.stringify(revenue)); }, [revenue]);
  useEffect(() => { localStorage.setItem('fishing_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('fishing_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('fishing_settings', JSON.stringify(settings)); }, [settings]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('fishing_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fishing_user');
  };

  // --- Session Management ---
  const createSession = (sessionData) => {
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      status: 'active', // active, completed
      startTime: Date.now(),
      additionalFees: 0,
      fishWeight: 0,
      fishSoldBack: 0,
      foodItems: [],
      addedTime: 0, // hours added later
    };
    setSessions([...sessions, newSession]);
    return newSession;
  };

  const updateSession = (id, updates) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const completeSession = (id, finalAmount) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, status: 'completed', endTime: Date.now(), finalTotal: finalAmount } : s));
    setRevenue(prev => prev + finalAmount);
  };

  // --- Product Management ---
  const addProduct = (product) => {
    setProducts([...products, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (id, updates) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // --- Customer Management ---
  const saveCustomer = (customerData) => {
    const existing = customers.find(c => c.phone === customerData.phone);
    if (existing) {
      setCustomers(customers.map(c => c.phone === customerData.phone ? { ...c, ...customerData } : c));
      return existing.id;
    } else {
      const newId = Date.now().toString();
      setCustomers([...customers, { ...customerData, id: newId }]);
      return newId;
    }
  };

  // --- Settings Management ---
  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
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
