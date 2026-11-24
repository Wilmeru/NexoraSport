import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, TextInput, ScrollView, Pressable,
  SafeAreaView, StatusBar, Alert, Modal, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const C = {
  dark: '#091526', cardDark: '#11223B', blue: '#25B4F8', blueDark: '#0D8FD1',
  bg: '#F4F7FA', white: '#FFFFFF', text: '#0F172A', muted: '#64748B',
  border: '#E2E8F0', green: '#16A34A', greenBg: '#DCFCE7', red: '#EF4444', redBg: '#FEE2E2', gold: '#F59E0B'
};

const KEYS = { P: '@nx_p', C: '@nx_c', F: '@nx_f', O: '@nx_o' };

const INIT_PRODUCTS = [
  { id: 'PROD-001', nombre: 'Zapatillas Deportivas Pro', categoria: 'Ropa Deportiva', precio: 189900, stock: 15, icon: '👟', bg: '#DBEAFE', descripcion: 'Zapatillas ligeras y resistentes, ideales para correr, entrenar y rendir al máximo.', ratings: [5, 5, 4, 5] },
  { id: 'PROD-002', nombre: 'Balón Profesional', categoria: 'Fútbol', precio: 89900, stock: 12, icon: '⚽', bg: '#E2E8F0', descripcion: 'Balón de fútbol oficial #5 termosellado de alta precisión y control óptimo.', ratings: [5, 4, 5] },
  { id: 'PROD-003', nombre: 'Mancuernas 10kg', categoria: 'Gimnasio', precio: 69900, stock: 8, icon: '🏋️', bg: '#E0F2FE', descripcion: 'Par de mancuernas hexagonales recubiertas en neopreno antideslizante.', ratings: [5, 5, 4] },
  { id: 'PROD-004', nombre: 'Guayos Tracción Élite', categoria: 'Fútbol', precio: 215000, stock: 6, icon: '🥾', bg: '#DBEAFE', descripcion: 'Botines diseñados para césped natural y sintético con ajuste anatómico.', ratings: [4, 5, 4] },
  { id: 'PROD-005', nombre: 'Balón Baloncesto Street', categoria: 'Baloncesto', precio: 95000, stock: 10, icon: '🏀', bg: '#FFEDD5', descripcion: 'Balón de caucho de alto agarre con canales profundos para cancha exterior.', ratings: [5, 4] },
  { id: 'PROD-006', nombre: 'Casco Aerodinámico Ruta', categoria: 'Ciclismo', precio: 145000, stock: 7, icon: '🪖', bg: '#E0F2FE', descripcion: 'Casco ultraligero con 18 ventilaciones y ajuste micrométrico trasero.', ratings: [5, 5, 5] },
  { id: 'PROD-007', nombre: 'Camiseta Compresión DryFit', categoria: 'Ropa Deportiva', precio: 64900, stock: 20, icon: '👕', bg: '#DBEAFE', descripcion: 'Prenda transpirable de secado rápido que regula la temperatura corporal.', ratings: [4, 4, 5] },
  { id: 'PROD-008', nombre: 'Bandas Elásticas Set x5', categoria: 'Gimnasio', precio: 42000, stock: 18, icon: '🎗️', bg: '#DCFCE7', descripcion: 'Set de 5 bandas de látex natural con diferentes niveles de resistencia.', ratings: [5, 4, 5] },
  { id: 'PROD-009', nombre: 'Guantes Ciclismo Gel Pro', categoria: 'Ciclismo', precio: 48000, stock: 14, icon: '🧤', bg: '#F1F5F9', descripcion: 'Guantes acolchados con inserciones de gel para absorber vibraciones.', ratings: [4, 5] },
  { id: 'PROD-010', nombre: 'Tablero y Aro Entrenamiento', categoria: 'Baloncesto', precio: 179000, stock: 4, icon: '🥅', bg: '#FEF3C7', descripcion: 'Aro metálico reforzado con red de nylon ideal para instalar en casa.', ratings: [5, 5, 4] },
  { id: 'PROD-011', nombre: 'Espinilleras Fibra Carbono', categoria: 'Fútbol', precio: 39000, stock: 0, icon: '🛡️', bg: '#FEE2E2', descripcion: 'Protección ultraligera de alto impacto con mangas de compresión.', ratings: [5, 4] },
  { id: 'PROD-012', nombre: 'Sudadera Térmica Running', categoria: 'Ropa Deportiva', precio: 112000, stock: 9, icon: '🧥', bg: '#E0E7FF', descripcion: 'Chaqueta cortavientos con bolsillos de cierre y detalles reflectivos.', ratings: [5, 5, 5] },
];

const CATS = [
  { k: 'Todas', l: 'Todas', i: '🏆' }, { k: 'Fútbol', l: 'Fútbol', i: '⚽' },
  { k: 'Gimnasio', l: 'Gimnasio', i: '🏋️' }, { k: 'Baloncesto', l: 'Baloncesto', i: '🏀' },
  { k: 'Ciclismo', l: 'Ciclismo', i: '🚴' }, { k: 'Ropa Deportiva', l: 'Ropa', i: '👕' },
];

const cop = (v) => '$' + Math.max(0, Math.round(Number(v) || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const avg = (r = []) => (r.length ? (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1) : '0.0');

function makeVariants(product, index = 0) {
  if (Array.isArray(product.variants) && product.variants.length) return product.variants;
  const labels = index % 3 === 0 ? ['S', 'M', 'L'] : index % 3 === 1 ? ['Negro', 'Azul', 'Blanco'] : ['Única'];
  const total = Math.max(0, Number(product.stock) || 0);
  return labels.map((label, i) => ({ id: `${product.id}-V${i + 1}`, etiqueta: label, color: index % 3 === 1 ? label : 'Estándar', talla: index % 3 === 0 ? label : 'Única', precio: Number(product.precio) || 0, stock: Math.floor(total / labels.length) + (i < total % labels.length ? 1 : 0) }));
}

export default function App() {
  const [products, setProducts] = useState(INIT_PRODUCTS.map((p, i) => ({ ...p, marca: ['Nexora','ProSport','Active','Nexora'][i % 4], variants: makeVariants(p, i) })));
  const [cart, setCart] = useState([]);
  const [favs, setFavs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);

  const [tab, setTab] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [qty, setQty] = useState(1);
  const [ratingVal, setRatingVal] = useState(5);

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [sort, setSort] = useState('none');

  const [couponIn, setCouponIn] = useState('');
  const [coupon, setCoupon] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [step, setStep] = useState('form');
  const [buyer, setBuyer] = useState({ name: '', phone: '', city: 'Mosquera', address: '' });
  const [orderModal, setOrderModal] = useState(null);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', categoria: 'Fútbol', precio: '', stock: '', descripcion: '', icon: '🏅' });
  const [toast, setToast] = useState('');

  // MARKETPLACE 2.0 · HU21-HU32 (datos en memoria y simulación académica)
  const [variantChoice, setVariantChoice] = useState({});
  const [compareIds, setCompareIds] = useState([]);
  const [filterBrand, setFilterBrand] = useState('Todas');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState('');
  const [addresses, setAddresses] = useState([{ id: 'DIR-1', alias: 'Casa', city: 'Mosquera', reference: 'Dirección ficticia de ejemplo', principal: true }]);
  const [selectedAddress, setSelectedAddress] = useState('DIR-1');
  const [addressForm, setAddressForm] = useState({ alias: '', city: 'Mosquera', reference: '' });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [shippingMode, setShippingMode] = useState('estandar');
  const [notifications, setNotifications] = useState([]);
  const [restockSubs, setRestockSubs] = useState([]);
  const [supportCases, setSupportCases] = useState([]);
  const [supportOrder, setSupportOrder] = useState('');
  const [supportReason, setSupportReason] = useState('Entrega');
  const [supportDescription, setSupportDescription] = useState('');
  const [featureSection, setFeatureSection] = useState('menu');
  const [manualRestock, setManualRestock] = useState('');

  const notify = (m) => { setToast(m); setTimeout(() => setToast((p) => (p === m ? '' : p)), 2400); };

  // Persistencia local (HU20)
  useEffect(() => {
    (async () => {
      try {
        const [sp, sc, sf, so] = await Promise.all(Object.values(KEYS).map((k) => AsyncStorage.getItem(k)));
        if (sp) { const p = JSON.parse(sp); if (Array.isArray(p) && p.length) setProducts(p.map((x, i) => { const variants = makeVariants(x, i); return { ...x, variants, stock: variants.reduce((a, v) => a + v.stock, 0), precio: Math.max(1, +x.precio || 1000) }; })); }
        if (sc) { const savedCart = JSON.parse(sc) || []; setCart(Array.isArray(savedCart) ? savedCart.map((item) => { const product = (sp ? JSON.parse(sp) : INIT_PRODUCTS).find((p) => p.id === item.id) || INIT_PRODUCTS.find((p) => p.id === item.id); const variants = product ? makeVariants(product, Math.max(0, INIT_PRODUCTS.findIndex((p) => p.id === product.id))) : []; const variant = variants.find((v) => v.id === item.variantId) || variants[0]; return variant && !item.variantId ? { ...item, variantId: variant.id, variantLabel: variant.etiqueta, unitPrice: variant.precio } : item; }) : []); }
        if (sf) setFavs(JSON.parse(sf) || []);
        if (so) setOrders(JSON.parse(so) || []);
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) AsyncStorage.setItem(KEYS.P, JSON.stringify(products)).catch(() => {}); }, [products, ready]);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEYS.C, JSON.stringify(cart)).catch(() => {}); }, [cart, ready]);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEYS.F, JSON.stringify(favs)).catch(() => {}); }, [favs, ready]);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEYS.O, JSON.stringify(orders)).catch(() => {}); }, [orders, ready]);

  // Filtros y cálculos
  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => (cat === 'Todas' || p.categoria === cat) && p.nombre.toLowerCase().includes(search.trim().toLowerCase()) && (filterBrand === 'Todas' || (p.marca || 'Nexora') === filterBrand) && (minPrice === '' || p.precio >= Number(minPrice)) && (maxPrice === '' || p.precio <= Number(maxPrice)) && (!onlyAvailable || p.stock > 0));
    if (sort === 'asc') list = [...list].sort((a, b) => a.precio - b.precio);
    if (sort === 'desc') list = [...list].sort((a, b) => b.precio - a.precio);
    return list;
  }, [products, cat, search, sort, filterBrand, minPrice, maxPrice, onlyAvailable]);

  const cartDetailed = useMemo(() => cart.map(c => {
    const p = products.find(x => x.id === c.id);
    const v = p?.variants?.find(x => x.id === c.variantId);
    const unit = c.unitPrice || v?.precio || p?.precio || 0;
    return p ? { ...c, p, v, unit, line: unit * c.q } : null;
  }).filter(Boolean), [cart, products]);

  const totalUnits = cart.reduce((a, b) => a + b.q, 0);
  const subtotal = cartDetailed.reduce((a, b) => a + b.line, 0);
  const discount = coupon === 'BIENVENIDO10' && subtotal > 0 ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 ? 0 : subtotal >= 150000 ? 0 : 8000;
  const total = Math.max(0, subtotal - discount) + shipping;

  // Acciones
  const toggleFav = (id) => {
    setFavs((prev) => prev.includes(id) ? (notify('Quitado de favoritos'), prev.filter((x) => x !== id)) : (notify('Guardado en favoritos ❤️'), [...prev, id]));
  };

  const addToCart = (prod, addQ = 1) => {
    if (prod?.variants?.length) return addVariantToCart(prod, prod.variants.find((v) => v.id === (variantChoice[prod.id] || prod.variants[0].id)), addQ);
    if (!prod || prod.stock <= 0) return Alert.alert('Agotado', 'Producto sin existencias disponibles.');
    const cur = cart.find((c) => c.id === prod.id)?.q || 0;
    if (cur + addQ > prod.stock) return Alert.alert('Stock límite', `Solo quedan ${prod.stock} unidades disponibles.`);
    setCart((prev) => cur ? prev.map((c) => (c.id === prod.id ? { ...c, q: c.q + addQ } : c)) : [...prev, { id: prod.id, q: addQ }]);
    notify(`Agregado (${addQ} un.) 🛒`);
    return true;
  };

  const updateQty = (id, variantId, delta) => {
    const prod = products.find(p => p.id === id);
    const item = cart.find(c => c.id === id && c.variantId === variantId);
    const variant = prod?.variants?.find(v => v.id === variantId);
    if (!prod || !item || !variant) return;
    if (item.q + delta <= 0) return setCart(prev => prev.filter(c => !(c.id === id && c.variantId === variantId)));
    if (item.q + delta > variant.stock) return Alert.alert('Límite de stock', `Máximo ${variant.stock} unidades.`);
    setCart(prev => prev.map(c => c.id === id && c.variantId === variantId ? { ...c, q: c.q + delta } : c));
  };

  const applyCoupon = () => {
    if (couponIn.trim().toUpperCase() === 'BIENVENIDO10') { setCoupon('BIENVENIDO10'); notify('Cupón BIENVENIDO10 aplicado (-10%)'); }
    else Alert.alert('Cupón inválido', 'Usa el código promocional BIENVENIDO10.');
  };

  const confirmOrder = () => {
    if (!selectedAddress || !currentAddress) return Alert.alert('Dirección requerida', 'Selecciona una dirección antes de confirmar.');
    if (!currentRate) return Alert.alert('Envío no disponible', 'Para este municipio no hay tarifa configurada en esta simulación.');
    for (const item of cartDetailed) {
      const variant = item.p.variants?.find(v => v.id === item.variantId);
      if (!variant || item.q > variant.stock) return Alert.alert('Sin stock', `Stock insuficiente en ${item.p.nombre}.`);
    }
    setProducts(prev => prev.map(p => {
      const bought = cart.filter(c => c.id === p.id);
      if (!bought.length) return p;
      const nextVariants = p.variants.map(v => {
        const item = bought.find(c => c.variantId === v.id);
        return item ? { ...v, stock: Math.max(0, v.stock - item.q) } : v;
      });
      return { ...p, variants: nextVariants, stock: nextVariants.reduce((sum, v) => sum + v.stock, 0) };
    }));
    const code = 'NX-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const order = {
      code, date: `${now.toLocaleDateString('es-CO')} ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
      buyer: { ...buyer, city: currentAddress.city, address: `${currentAddress.alias}: ${currentAddress.reference}` },
      address: { ...currentAddress }, shippingMode,
      items: cartDetailed.map(i => ({ id: i.p.id, variantId: i.variantId, variantLabel: i.variantLabel, nombre: i.p.nombre, icon: i.p.icon, q: i.q, unit: i.unit, line: i.line })),
      subtotal, discount, coupon, shipping: dynamicShipping, total: dynamicTotal,
      status: 'Confirmado', events: [{ status: 'Confirmado', date: now.toLocaleString('es-CO') }], stockReturned: false
    };
    setOrders(prev => [order, ...prev]);
    pushNotice(`pedido-${code}-confirmado`, `Pedido ${code}: compra confirmada.`);
    setCart([]); setCoupon(null); setCouponIn(''); setCheckoutOpen(false); setStep('form'); setTab('history');
    Alert.alert('¡Pedido confirmado!', `Código: ${code}\nTotal: ${cop(dynamicTotal)}\nSimulación académica sin cobro real.`);
  };

  const saveSellerProduct = () => {
    const precio = Number(form.precio), stock = Number(form.stock);
    if (!form.nombre.trim()) return Alert.alert('Error', 'Ingresa el nombre del producto.');
    if (!Number.isInteger(precio) || precio <= 0) return Alert.alert('Error', 'Precio entero positivo en COP.');
    if (!Number.isInteger(stock) || stock < 0) return Alert.alert('Error', 'Stock entero mayor o igual a 0.');
    if (form.descripcion.trim().length < 15) return Alert.alert('Error', 'Descripción mínimo de 15 caracteres.');

    if (editId) {
      setProducts((prev) => prev.map((p) => (p.id === editId ? { ...p, ...form, precio, stock, variants: makeVariants({ ...p, precio, stock, variants: [] }, products.indexOf(p)) } : p)));
      notify('Producto actualizado');
    } else {
      setProducts((prev) => [{ id: 'PROD-' + Date.now().toString().slice(-4), ...form, precio, stock, variants: makeVariants({id:'PROD-'+Date.now(),precio,stock}, products.length), marca:'Nexora', bg: '#DBEAFE', ratings: [5] }, ...prev]);
      notify('Producto creado');
    }
    setEditId(null);
    setForm({ nombre: '', categoria: 'Fútbol', precio: '', stock: '', descripcion: '', icon: '🏅' });
  };

  // Vistas
  const Header = ({ title, rightIcon, onRight }) => (
    <View style={s.subHeader}>
      <Pressable style={s.iconBtn} onPress={() => (detailId ? setDetailId(null) : setTab('home'))}><Text style={s.whiteBold}>←</Text></Pressable>
      <Text style={s.subTitle}>{title}</Text>
      {rightIcon ? <Pressable style={s.iconBtn} onPress={onRight}><Text style={{ fontSize: 18 }}>{rightIcon}</Text></Pressable> : <View style={{ width: 36 }} />}
    </View>
  );

  const selectedProd = products.find((p) => p.id === detailId);
  const selectedVariantId = selectedProd ? (variantChoice[selectedProd.id] || selectedProd.variants?.[0]?.id) : null;
  const selectedVariant = selectedProd?.variants?.find((v) => v.id === selectedVariantId) || selectedProd?.variants?.[0];
  const shippingRates = { Mosquera: { estandar: 6000, express: 10000, days: '1 a 2 días' }, Funza: { estandar: 8000, express: 12000, days: '1 a 2 días' }, Madrid: { estandar: 10000, express: 14000, days: '2 a 3 días' } };
  const currentAddress = addresses.find((a) => a.id === selectedAddress);
  const currentRate = currentAddress ? shippingRates[currentAddress.city] : null;
  const dynamicShipping = subtotal === 0 ? 0 : (currentRate ? currentRate[shippingMode] : 0);
  const dynamicTotal = Math.max(0, subtotal - discount) + dynamicShipping;
  const filteredProducts = products.filter((p) => {
    const searchOk = p.nombre.toLowerCase().includes(search.trim().toLowerCase());
    const categoryOk = cat === 'Todas' || p.categoria === cat;
    const minOk = minPrice === '' || p.precio >= Number(minPrice);
    const maxOk = maxPrice === '' || p.precio <= Number(maxPrice);
    const brandOk = filterBrand === 'Todas' || (p.marca || 'Nexora') === filterBrand;
    const stockOk = !onlyAvailable || p.stock > 0;
    return searchOk && categoryOk && minOk && maxOk && brandOk && stockOk;
  });
  const pushNotice = (key, message) => setNotifications((prev) => prev.some((n) => n.key === key) ? prev : [{ id: 'NOT-' + Date.now(), key, message, date: new Date().toLocaleString('es-CO'), read: false }, ...prev]);
  const setOrderState = (code, nextState) => setOrders((prev) => prev.map((o) => o.code === code ? { ...o, status: nextState, events: [...(o.events || [{ status: 'Confirmado', date: o.date }]), { status: nextState, date: new Date().toLocaleString('es-CO') }] } : o));
  const toggleCompare = (id) => setCompareIds((prev) => {
    if (prev.includes(id)) return prev.filter((x) => x !== id);
    if (prev.length >= 3) { Alert.alert('Límite alcanzado', 'Puedes comparar máximo tres productos.'); return prev; }
    return [...prev, id];
  });
  const addVariantToCart = (prod, variant, addQ = 1) => {
    if (!variant) return Alert.alert('Selecciona una variante', 'Elige una talla, color o presentación.');
    const existing = cart.find((c) => c.id === prod.id && c.variantId === variant.id);
    const currentQ = existing?.q || 0;
    if (variant.stock <= 0 || currentQ + addQ > variant.stock) return Alert.alert('Stock insuficiente', `Máximo disponible: ${variant.stock} unidades.`);
    setCart((prev) => existing ? prev.map((c) => c.id === prod.id && c.variantId === variant.id ? { ...c, q: c.q + addQ } : c) : [...prev, { id: prod.id, variantId: variant.id, variantLabel: variant.etiqueta, unitPrice: variant.precio, q: addQ }]);
    notify('Variante agregada al carrito'); return true;
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />
      {!!toast && <View style={s.toast}><Text style={s.toastTxt}>{toast}</Text></View>}

      <View style={s.body}>
        {/* 1. DETALLE DE PRODUCTO (Boceto 2) */}
        {selectedProd ? (
          <View style={s.f1}>
            <Header title="Detalle del producto" rightIcon={favs.includes(selectedProd.id) ? '❤️' : '🤍'} onRight={() => toggleFav(selectedProd.id)} />
            <ScrollView style={s.pad}>
              <View style={[s.detailImg, { backgroundColor: selectedProd.bg }]}><Text style={{ fontSize: 84 }}>{selectedProd.icon}</Text></View>
              <Text style={s.h1}>{selectedProd.nombre}</Text>
              <View style={s.rowGap}>
                <Text>⭐⭐⭐⭐⭐</Text>
                <Text style={s.muted}>{avg(selectedProd.ratings)} ({selectedProd.ratings.length} reseñas)</Text>
              </View>
              <View style={s.rowBetween}>
                <Text style={s.bigPrice}>{cop(selectedVariant?.precio || selectedProd.precio)}</Text>
                <View style={[s.pill, { backgroundColor: selectedProd.stock > 0 ? C.greenBg : C.redBg }]}>
                  <Text style={{ color: selectedProd.stock > 0 ? C.green : C.red, fontWeight: '800', fontSize: 12 }}>
                    {(selectedVariant?.stock || 0) > 0 ? `En stock • ${selectedVariant.stock} und.` : 'Agotado'}
                  </Text>
                </View>
              </View>
              <View style={s.catBadge}><Text style={s.catBadgeTxt}>🏷️ {selectedProd.categoria}</Text></View>
              <Text style={s.desc}>{selectedProd.descripcion}</Text>

              <View style={s.boxCard}>
                <Text style={s.bold13}>Selecciona talla, color o presentación</Text>
                <View style={[s.rowGap, { flexWrap: 'wrap', marginTop: 8 }]}>
                  {(selectedProd.variants || []).map((v) => (
                    <Pressable key={v.id} onPress={() => { setVariantChoice((old) => ({ ...old, [selectedProd.id]: v.id })); setQty(1); }} style={[s.sortBtn, selectedVariant?.id === v.id && { backgroundColor: C.dark, borderColor: C.blue }]}>
                      <Text style={[s.sortTxt, selectedVariant?.id === v.id && { color: C.blue }]}>{v.etiqueta}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={[s.muted, { marginTop: 8 }]}>Precio: {cop(selectedVariant?.precio || selectedProd.precio)} · Disponibles: {selectedVariant?.stock || 0}</Text>
              </View>
              <View style={s.rowGap}>
                <View style={s.qtyBox}>
                  <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))}><Text style={s.step}>−</Text></Pressable>
                  <Text style={s.bold16}>{qty}</Text>
                  <Pressable onPress={() => setQty((q) => (selectedVariant?.stock > 0 ? Math.min(selectedVariant.stock, q + 1) : 1))}><Text style={s.step}>+</Text></Pressable>
                </View>
                <Pressable style={s.favSq} onPress={() => toggleFav(selectedProd.id)}><Text style={{ fontSize: 20 }}>{favs.includes(selectedProd.id) ? '❤️' : '🤍'}</Text></Pressable>
              </View>

              <Pressable style={[s.btnDark, !(selectedVariant?.stock > 0) && s.off]} disabled={!(selectedVariant?.stock > 0)} onPress={() => addVariantToCart(selectedProd, selectedVariant, qty)}>
                <Text style={s.btnTxt}>{selectedVariant?.stock > 0 ? '🛒 Agregar al carrito' : 'Variante agotada'}</Text>
              </Pressable>
              <Pressable style={[s.btnBlue, !(selectedVariant?.stock > 0) && s.off]} disabled={!(selectedVariant?.stock > 0)} onPress={() => { if (addVariantToCart(selectedProd, selectedVariant, qty)) { setDetailId(null); setTab('cart'); } }}>
                <Text style={s.btnTxt}>Comprar ahora</Text>
              </Pressable>

              {/* Reseñas HU19 */}
              <View style={s.boxCard}>
                <Text style={s.bold13}>Califica este producto (1 a 5 ⭐)</Text>
                <View style={[s.rowGap, { marginTop: 8 }]}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} style={[s.starBtn, ratingVal === n && { backgroundColor: C.gold }]} onPress={() => setRatingVal(n)}>
                      <Text style={{ fontWeight: '700', color: ratingVal === n ? C.white : C.text }}>{n}★</Text>
                    </Pressable>
                  ))}
                  <Pressable style={s.miniDarkBtn} onPress={() => { setProducts((p) => p.map((x) => (x.id === selectedProd.id ? { ...x, ratings: [...x.ratings, ratingVal] } : x))); notify(`Calificado con ${ratingVal}★`); }}>
                    <Text style={s.whiteBold}>Enviar</Text>
                  </Pressable>
                </View>
              </View>
              <View style={s.boxCard}>
                <Text style={s.bold13}>Preguntas sobre este producto · HU24</Text>
                <TextInput style={s.input} placeholder="Escribe mínimo 10 caracteres" value={questionDraft} onChangeText={setQuestionDraft}/>
                <Pressable style={s.miniDarkBtn} onPress={()=>{if(questionDraft.trim().length<10)return Alert.alert('Pregunta muy corta','Escribe al menos 10 caracteres.');setQuestions(prev=>[{id:'PREG-'+Date.now(),productId:selectedProd.id,text:questionDraft.trim(),status:'Pendiente',date:new Date().toLocaleString('es-CO')},...prev]);setQuestionDraft('');notify('Pregunta registrada como pendiente');}}><Text style={s.whiteBold}>Enviar pregunta</Text></Pressable>
                {questions.filter(q=>q.productId===selectedProd.id).map(q=><View key={q.id} style={{marginTop:10}}><Text style={s.bold13}>{q.text}</Text><Text style={s.smallMuted}>{q.date} · {q.status}</Text>{q.status==='Pendiente'?<Pressable onPress={()=>setQuestions(prev=>prev.map(x=>x.id===q.id?{...x,status:'Respondida',answer:'Respuesta de demostración: consulta las especificaciones y disponibilidad mostradas en esta ficha.'}:x))}><Text style={{color:C.blue,fontWeight:'800'}}>Simular respuesta</Text></Pressable>:<Text style={s.muted}>{q.answer}</Text>}</View>)}
              </View>
              <View style={s.boxCard}><Text style={s.bold13}>Productos relacionados · HU31</Text>{products.filter(p=>p.categoria===selectedProd.categoria&&p.id!==selectedProd.id&&p.stock>0).slice(0,4).map(p=><Pressable key={p.id} style={s.listCard} onPress={()=>{setDetailId(p.id);setQty(1);}}><Text>{p.icon}</Text><Text style={s.f1}>{p.nombre}</Text><Text style={s.price}>{cop(p.precio)}</Text></Pressable>)}{products.filter(p=>p.categoria===selectedProd.categoria&&p.id!==selectedProd.id&&p.stock>0).length===0&&<Text style={s.muted}>No hay otros productos disponibles de esta categoría.</Text>}</View>
              <Pressable onPress={() => setDetailId(null)} style={{ alignItems: 'center', marginVertical: 16 }}><Text style={s.mutedBold}>← Volver al catálogo</Text></Pressable>
            </ScrollView>
          </View>
        ) : tab === 'home' ? (
          /* 2. INICIO / CATÁLOGO (Boceto 1) */
          <ScrollView style={s.f1} showsVerticalScrollIndicator={false}>
            <View style={s.topHeader}>
              <View style={s.rowBetween}>
                <View style={s.rowGap}>
                  <View style={s.logo}><Text style={s.logoTxt}>N</Text></View>
                  <View>
                    <Text style={s.brand}>NEXORA <Text style={{ color: C.blue }}>SPORT</Text></Text>
                    <Text style={s.slogan}>Supera tus límites, equipa tu pasión</Text>
                  </View>
                </View>
                <View style={s.rowGap}>
                  <Pressable style={s.adminChip} onPress={() => setTab('seller')}><Text style={{ color: C.blue, fontWeight: '700', fontSize: 12 }}>⚙️ Admin</Text></Pressable>
                  <Pressable onPress={() => setTab('cart')} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 23 }}>🛒</Text>
                    {totalUnits > 0 && <View style={s.badge}><Text style={s.badgeTxt}>{totalUnits}</Text></View>}
                  </Pressable>
                </View>
              </View>

              <View style={s.searchBox}>
                <Text>🔍 </Text>
                <TextInput style={s.f1} placeholder="Buscar productos..." placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />
                {!!search && <Pressable onPress={() => setSearch('')}><Text style={s.muted}>✕</Text></Pressable>}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {CATS.map((c) => (
                  <Pressable key={c.k} style={{ alignItems: 'center', width: 60 }} onPress={() => setCat(c.k)}>
                    <View style={[s.catCircle, cat === c.k && { backgroundColor: C.blue, borderColor: C.white }]}><Text style={{ fontSize: 21 }}>{c.i}</Text></View>
                    <Text style={[s.catTxt, cat === c.k && { color: C.blue, fontWeight: '800' }]}>{c.l}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Banner promocional */}
            <View style={s.banner}>
              <View style={s.f1}>
                <Text style={s.bannerTitle}>EQUÍPATE PARA LLEGAR MÁS LEJOS</Text>
                <Text style={{ color: C.blue, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Cupón: BIENVENIDO10 (-10%)</Text>
                <Pressable style={s.bannerBtn} onPress={() => { setDetailId(products[0].id); setQty(1); }}><Text style={{ color: C.dark, fontWeight: '800', fontSize: 12 }}>Comprar ahora →</Text></Pressable>
              </View>
              <Text style={{ fontSize: 40 }}>👟⚡</Text>
            </View>

            <View style={[s.rowGap, { paddingHorizontal: 16, marginBottom: 10 }]}>
              <Pressable style={[s.miniDarkBtn, { marginLeft: 0 }]} onPress={() => { setTab('features'); setFeatureSection('comparar'); }}><Text style={s.whiteBold}>⚖️ Comparar ({compareIds.length}/3)</Text></Pressable>
              <Pressable style={s.applyBtn} onPress={() => { setTab('features'); setFeatureSection('filtros'); }}><Text style={s.whiteBold}>☷ Filtros avanzados</Text></Pressable>
              <Pressable style={s.sortBtn} onPress={() => { setTab('features'); setFeatureSection('menu'); }}><Text style={s.sortTxt}>Más funciones</Text></Pressable>
            </View>
            <View style={[s.rowBetween, { paddingHorizontal: 16, marginBottom: 10 }]}>
              <Text style={s.h2}>Productos ({visibleProducts.length})</Text>
              <View style={s.rowGap}>
                <Pressable style={[s.sortBtn, sort === 'asc' && s.sortOn]} onPress={() => setSort(sort === 'asc' ? 'none' : 'asc')}><Text style={[s.sortTxt, sort === 'asc' && { color: C.blue }]}>Menor $</Text></Pressable>
                <Pressable style={[s.sortBtn, sort === 'desc' && s.sortOn]} onPress={() => setSort(sort === 'desc' ? 'none' : 'desc')}><Text style={[s.sortTxt, sort === 'desc' && { color: C.blue }]}>Mayor $</Text></Pressable>
              </View>
            </View>

            {visibleProducts.length === 0 ? (
              <View style={s.empty}>
                <Text style={{ fontSize: 48 }}>🔎</Text>
                <Text style={s.h2}>No encontramos productos</Text>
                <Pressable style={s.bannerBtn} onPress={() => { setSearch(''); setCat('Todas'); setSort('none'); }}><Text style={s.whiteBold}>Ver todos</Text></Pressable>
              </View>
            ) : (
              <View style={s.grid}>
                {visibleProducts.map((item) => (
                  <Pressable key={item.id} style={s.card} onPress={() => { setDetailId(item.id); setQty(1); }}>
                    <Pressable style={s.favIcon} onPress={() => toggleFav(item.id)}><Text>{favs.includes(item.id) ? '❤️' : '🤍'}</Text></Pressable>
                    <View style={[s.cardImg, { backgroundColor: item.bg }]}><Text style={{ fontSize: 44 }}>{item.icon}</Text></View>
                    <Text style={s.smallMuted}>{item.categoria}</Text>
                    <Text style={s.bold13} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={s.price}>{cop(item.precio)}</Text>
                    <Pressable onPress={() => toggleCompare(item.id)}><Text style={{ color: C.blue, fontSize: 11, fontWeight: '800' }}>{compareIds.includes(item.id) ? '✓ En comparador' : '＋ Comparar'}</Text></Pressable>
                    <View style={s.rowBetween}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: item.stock > 0 ? C.green : C.red }}>{item.stock > 0 ? `● Stock: ${item.stock}` : '● Agotado'}</Text>
                      <Pressable style={[s.addBtn, !item.stock && { backgroundColor: '#CBD5E1' }]} disabled={!item.stock} onPress={() => { setDetailId(item.id); setQty(1); }}>
                        <Text style={{ color: C.white, fontSize: 11, fontWeight: '800' }}>{item.stock ? 'Elegir opción' : 'Sin stock'}</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        ) : tab === 'cart' ? (
          /* 3. CARRITO DE COMPRAS (Boceto 3) */
          <View style={s.f1}>
            <Header title="Mi carrito" rightIcon="🗑️" onRight={() => cart.length && Alert.alert('Vaciar', '¿Vaciar carrito?', [{ text: 'No' }, { text: 'Sí', onPress: () => { setCart([]); setCoupon(null); } }])} />
            {cartDetailed.length === 0 ? (
              <View style={s.empty}>
                <Text style={{ fontSize: 50 }}>🛒</Text>
                <Text style={s.h2}>Tu carrito está vacío</Text>
                <Pressable style={[s.btnBlue, { paddingHorizontal: 24 }]} onPress={() => setTab('home')}><Text style={s.btnTxt}>Ir al catálogo</Text></Pressable>
              </View>
            ) : (
              <ScrollView style={s.pad}>
                {cartDetailed.map(({ p, q, variantId, line }) => (
                  <View key={variantId || p.id} style={s.listCard}>
                    <View style={[s.thumb, { backgroundColor: p.bg }]}><Text style={{ fontSize: 26 }}>{p.icon}</Text></View>
                    <View style={s.f1}>
                      <Text style={s.bold13} numberOfLines={1}>{p.nombre}</Text>
                      <Text style={s.price}>{cop(cartDetailed.find(x=>x.p.id===p.id)?.unit || p.precio)} · {cartDetailed.find(x=>x.p.id===p.id)?.variantLabel || 'Estándar'}</Text>
                      <View style={s.rowGap}>
                        <Pressable style={s.miniStep} onPress={() => updateQty(p.id, variantId, -1)}><Text style={s.bold13}>−</Text></Pressable>
                        <Text style={s.bold13}>{q}</Text>
                        <Pressable style={s.miniStep} onPress={() => updateQty(p.id, variantId, 1)}><Text style={s.bold13}>+</Text></Pressable>
                      </View>
                    </View>
                    <Pressable onPress={() => setCart((prev) => prev.filter((c) => !(c.id === p.id && c.variantId === variantId)))}><Text style={{ fontSize: 18 }}>🗑️</Text></Pressable>
                  </View>
                ))}

                <View style={[s.rowGap, { marginVertical: 10 }]}>
                  <TextInput style={[s.input, s.f1, { marginBottom: 0 }]} placeholder="Cupón (BIENVENIDO10)" autoCapitalize="characters" value={couponIn} onChangeText={setCouponIn} />
                  <Pressable style={s.applyBtn} onPress={applyCoupon}><Text style={s.whiteBold}>Aplicar</Text></Pressable>
                </View>

                <View style={s.boxCard}>
                  <View style={s.rowBetween}><Text style={s.muted}>Subtotal</Text><Text style={s.bold13}>{cop(subtotal)}</Text></View>
                  {discount > 0 && <View style={s.rowBetween}><Text style={{ color: C.green }}>Descuento (10%)</Text><Text style={{ color: C.green, fontWeight: '700' }}>-{cop(discount)}</Text></View>}
                  <View style={[s.rowBetween, { marginTop: 6 }]}>
                    <Text style={s.muted}>Envío</Text>
                    <View style={s.rowGap}>
                      {dynamicShipping === 0 && <View style={s.freeBadge}><Text style={{ color: C.green, fontSize: 11, fontWeight: '800' }}>¡Envío gratis!</Text></View>}
                      <Text style={s.bold13}>{cop(dynamicShipping)}</Text>
                    </View>
                  </View>
                  <View style={s.hr} />
                  <View style={s.rowBetween}><Text style={s.h2}>Total</Text><Text style={s.bigPrice}>{cop(dynamicTotal)}</Text></View>
                  <Pressable style={[s.btnBlue, { marginTop: 12 }]} onPress={() => { setStep('form'); setCheckoutOpen(true); }}><Text style={s.btnTxt}>Continuar compra →</Text></Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        ) : tab === 'favorites' ? (
          /* 4. FAVORITOS */
          <View style={s.f1}>
            <Header title={`Favoritos (${favs.length})`} />
            {favs.length === 0 ? (
              <View style={s.empty}><Text style={{ fontSize: 50 }}>❤️</Text><Text style={s.h2}>Sin favoritos guardados</Text><Pressable style={[s.btnBlue, { paddingHorizontal: 24 }]} onPress={() => setTab('home')}><Text style={s.btnTxt}>Explorar</Text></Pressable></View>
            ) : (
              <ScrollView style={s.pad}>
                {products.filter((p) => favs.includes(p.id)).map((p) => (
                  <Pressable key={p.id} style={s.listCard} onPress={() => { setDetailId(p.id); setQty(1); }}>
                    <View style={[s.thumb, { backgroundColor: p.bg }]}><Text style={{ fontSize: 26 }}>{p.icon}</Text></View>
                    <View style={s.f1}><Text style={s.bold13}>{p.nombre}</Text><Text style={s.price}>{cop(p.precio)}</Text></View>
                    <Pressable onPress={() => toggleFav(p.id)}><Text style={{ fontSize: 20 }}>❤️</Text></Pressable>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : tab === 'history' ? (
          /* 5. HISTORIAL */
          <View style={s.f1}>
            <Header title="Historial de Pedidos" />
            {orders.length === 0 ? (
              <View style={s.empty}><Text style={{ fontSize: 50 }}>📦</Text><Text style={s.h2}>No hay pedidos registrados</Text><Pressable style={[s.btnBlue, { paddingHorizontal: 24 }]} onPress={() => setTab('home')}><Text style={s.btnTxt}>Ir a comprar</Text></Pressable></View>
            ) : (
              <ScrollView style={s.pad}>
                {orders.map((o) => (
                  <Pressable key={o.code} style={[s.boxCard, { borderLeftWidth: 4, borderLeftColor: C.blue, marginBottom: 10 }]} onPress={() => setOrderModal(o)}>
                    <View style={s.rowBetween}><Text style={s.bold13}>Pedido #{o.code}</Text><Text style={{ color: o.status==='Cancelado'?C.red:C.green, fontWeight: '800', fontSize: 12 }}>{o.status || 'Confirmado'}</Text></View>
                    <Text style={s.smallMuted}>📅 {o.date} • 📍 {o.buyer.city}</Text>
                    <View style={[s.rowBetween, { marginTop: 6 }]}><Text style={s.muted}>{o.items.length} artículo(s)</Text><Text style={s.price}>{cop(o.total)}</Text></View>
                    <View style={[s.rowGap,{marginTop:8,flexWrap:'wrap'}]}>
                      {(o.status||'Confirmado')!=='Entregado'&&(o.status||'Confirmado')!=='Cancelado'&&<Pressable style={s.miniDarkBtn} onPress={()=>{const flow=['Confirmado','Preparando','En camino','Entregado'];const next=flow[Math.min(flow.indexOf(o.status||'Confirmado')+1,3)];setOrderState(o.code,next);pushNotice(`pedido-${o.code}-${next}`,`Pedido ${o.code}: ${next}.`);}}><Text style={s.whiteBold}>Simular avance de entrega</Text></Pressable>}
                      {['Confirmado','Preparando'].includes(o.status||'Confirmado')&&<Pressable style={s.sortBtn} onPress={()=>Alert.alert('Cancelar pedido',`¿Cancelar ${o.code}?`,[{text:'No'},{text:'Sí, cancelar',onPress:()=>{if(o.stockReturned)return;setProducts(prev=>prev.map(p=>{const items=o.items.filter(i=>i.id===p.id);if(!items.length)return p;const variants=p.variants.map(v=>{const item=items.find(i=>i.variantId===v.id);return item?{...v,stock:v.stock+item.q}:v;});return {...p,variants,stock:variants.reduce((a,v)=>a+v.stock,0)};}));setOrders(prev=>prev.map(x=>x.code===o.code?{...x,status:'Cancelado',stockReturned:true,events:[...(x.events||[]),{status:'Cancelado',date:new Date().toLocaleString('es-CO')}]}:x));pushNotice(`pedido-${o.code}-cancelado`,`Pedido ${o.code}: cancelado y stock reintegrado.`);}}])}><Text style={s.sortTxt}>Cancelar</Text></Pressable>}
                    </View>
                    {!!o.events&&o.events.map((ev,i)=><Text key={i} style={s.smallMuted}>• {ev.status} — {ev.date}</Text>)}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : tab === 'features' ? (
          <View style={s.f1}>
            <Header title={featureSection === 'menu' ? 'Marketplace 2.0' : ({comparar:'Comparador', filtros:'Filtros combinados', direcciones:'Mis direcciones', notificaciones:'Notificaciones', reposicion:'Avisos de reposición', ayuda:'Centro de ayuda'})[featureSection] || 'Marketplace 2.0'} />
            <ScrollView style={s.pad}>
              {featureSection === 'menu' && <>
                <Text style={s.h2}>Nuevas funcionalidades HU21–HU32</Text>
                {[['comparar','⚖️ Comparador de productos · HU22'],['filtros','☷ Filtros combinados · HU23'],['direcciones','📍 Libreta de direcciones · HU25'],['notificaciones','🔔 Centro de notificaciones · HU29'],['reposicion','📦 Avisos de reposición · HU30'],['ayuda','🛟 Centro de ayuda · HU32']].map(([key,label]) => <Pressable key={key} style={s.listCard} onPress={() => setFeatureSection(key)}><Text style={s.bold13}>{label}</Text><Text style={s.muted}>Abrir →</Text></Pressable>)}
                <View style={s.boxCard}><Text style={s.bold13}>HU24 · Preguntas del producto</Text><Text style={s.muted}>Abre el detalle de cualquier producto para enviar preguntas y simular respuestas.</Text></View>
                <View style={s.boxCard}><Text style={s.bold13}>HU26 · Envíos</Text><Text style={s.muted}>Elige una dirección y modalidad en el carrito/checkout para calcular la tarifa ficticia.</Text></View>
                <View style={s.boxCard}><Text style={s.bold13}>HU27–HU28 · Seguimiento y cancelación</Text><Text style={s.muted}>Entra a Historial, abre un pedido y usa los controles de simulación.</Text></View>
                <View style={s.boxCard}><Text style={s.bold13}>HU31 · Recomendaciones</Text><Text style={s.muted}>Las recomendaciones aparecen en el detalle del producto.</Text></View>
              </>}
              {featureSection === 'comparar' && <>
                <Text style={s.muted}>Selecciona entre 2 y 3 productos desde el catálogo o aquí.</Text>
                {products.map((p) => <Pressable key={p.id} style={s.listCard} onPress={() => toggleCompare(p.id)}><Text style={s.f1}>{p.nombre} · {cop(p.precio)} · {p.stock > 0 ? 'Disponible' : 'Agotado'}</Text><Text style={s.bold13}>{compareIds.includes(p.id) ? '☑' : '☐'}</Text></Pressable>)}
                <Text style={s.h2}>Comparación ({compareIds.length}/3)</Text>
                {compareIds.length < 2 ? <Text style={s.muted}>Selecciona al menos dos productos.</Text> : compareIds.map((id) => { const p=products.find(x=>x.id===id); return p ? <View key={id} style={s.boxCard}><Text style={s.bold13}>{p.nombre}</Text><Text>Marca: {p.marca || 'Nexora'}</Text><Text>Precio: {cop(p.precio)}</Text><Text>Disponibilidad: {p.stock > 0 ? `Disponible (${p.stock})` : 'Agotado'}</Text><Pressable onPress={() => toggleCompare(id)}><Text style={{color:C.red,marginTop:6}}>Retirar de comparación</Text></Pressable></View> : null; })}
              </>}
              {featureSection === 'filtros' && <>
                <Text style={s.bold13}>Marca</Text><View style={[s.rowGap,{flexWrap:'wrap',marginVertical:8}]}>{['Todas',...Array.from(new Set(products.map(p=>p.marca||'Nexora')))].map(b=><Pressable key={b} style={[s.sortBtn,filterBrand===b&&s.sortOn]} onPress={()=>setFilterBrand(b)}><Text style={s.sortTxt}>{b}</Text></Pressable>)}</View>
                <TextInput style={s.input} placeholder="Precio mínimo COP" keyboardType="numeric" value={minPrice} onChangeText={setMinPrice}/><TextInput style={s.input} placeholder="Precio máximo COP" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice}/>
                <Pressable style={s.btnDark} onPress={()=>setOnlyAvailable(v=>!v)}><Text style={s.btnTxt}>{onlyAvailable?'✓ Solo disponibles':'Mostrar solo disponibles'}</Text></Pressable>
                <Pressable style={s.btnBlue} onPress={()=>{ if(minPrice!==''&&maxPrice!==''&&Number(minPrice)>Number(maxPrice)) return Alert.alert('Rango inválido','El precio mínimo no puede superar el máximo.'); setTab('home'); }}><Text style={s.btnTxt}>Aplicar filtros</Text></Pressable>
                <Pressable style={s.btnDark} onPress={()=>{setFilterBrand('Todas');setMinPrice('');setMaxPrice('');setOnlyAvailable(false);setSearch('');setCat('Todas');setSort('none');}}><Text style={s.btnTxt}>Restablecer filtros</Text></Pressable>
                <Text style={[s.h2,{marginTop:12}]}>Resultados: {filteredProducts.length}</Text>{filteredProducts.map(p=><Pressable key={p.id} style={s.listCard} onPress={()=>{setDetailId(p.id);setQty(1);}}><Text>{p.icon}</Text><Text style={s.f1}>{p.nombre}</Text><Text style={s.bold13}>{cop(p.precio)}</Text></Pressable>)}{filteredProducts.length===0&&<Text style={s.muted}>No hay productos que cumplan todos los filtros.</Text>}
              </>}
              {featureSection === 'direcciones' && <>
                <Text style={s.bold13}>Registrar dirección ficticia</Text><TextInput style={s.input} placeholder="Alias (Casa, Trabajo...)" value={addressForm.alias} onChangeText={v=>setAddressForm({...addressForm,alias:v})}/><TextInput style={s.input} placeholder="Municipio (Mosquera, Funza o Madrid)" value={addressForm.city} onChangeText={v=>setAddressForm({...addressForm,city:v})}/><TextInput style={s.input} placeholder="Referencia de entrega" value={addressForm.reference} onChangeText={v=>setAddressForm({...addressForm,reference:v})}/>
                <Pressable style={s.btnBlue} onPress={()=>{if(!addressForm.alias.trim()||!addressForm.reference.trim()||!addressForm.city.trim())return Alert.alert('Datos incompletos','Completa alias, municipio y referencia.');if(editingAddressId){setAddresses(prev=>prev.map(a=>a.id===editingAddressId?{...a,...addressForm}:a));setEditingAddressId(null);notify('Dirección actualizada');}else{const id='DIR-'+Date.now();setAddresses(a=>[...a,{...addressForm,id,principal:a.length===0}]);setSelectedAddress(id);notify('Dirección registrada');}setAddressForm({alias:'',city:'Mosquera',reference:''});}}><Text style={s.btnTxt}>{editingAddressId?'Guardar cambios':'Guardar dirección'}</Text></Pressable>
                {addresses.map(a=><View key={a.id} style={s.boxCard}><Text style={s.bold13}>{a.alias} {a.principal?'⭐ Principal':''}</Text><Text>{a.city} · {a.reference}</Text><View style={s.rowGap}><Pressable style={s.miniDarkBtn} onPress={()=>{setAddresses(prev=>prev.map(x=>({...x,principal:x.id===a.id})));setSelectedAddress(a.id);}}><Text style={s.whiteBold}>Hacer principal / elegir</Text></Pressable><Pressable onPress={()=>{setEditingAddressId(a.id);setAddressForm({alias:a.alias,city:a.city,reference:a.reference});}}><Text style={{color:C.blue}}>Editar</Text></Pressable><Pressable onPress={()=>{setAddresses(prev=>prev.filter(x=>x.id!==a.id));if(selectedAddress===a.id)setSelectedAddress('');}}><Text style={{color:C.red}}>Eliminar</Text></Pressable></View></View>)}
              </>}
              {featureSection === 'notificaciones' && <>{notifications.length===0?<Text style={s.muted}>No tienes notificaciones por ahora.</Text>:notifications.map(n=><Pressable key={n.id} style={s.boxCard} onPress={()=>setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}><Text style={s.bold13}>{n.read?'✓':'🔵'} {n.message}</Text><Text style={s.smallMuted}>{n.date}</Text></Pressable>)}</>}
              {featureSection === 'reposicion' && <>
                <Text style={s.muted}>Suscríbete a una variante agotada. Puedes cancelar el aviso antes de la reposición.</Text>
                {products.map(p=><View key={p.id} style={s.boxCard}><Text style={s.bold13}>{p.nombre}</Text>{p.variants.map(v=><View key={v.id} style={[s.rowBetween,{marginTop:8}]}><View style={s.f1}><Text>{v.etiqueta} · {v.id}</Text><Text style={s.smallMuted}>Stock: {v.stock}</Text></View>{v.stock===0?<Pressable onPress={()=>{setRestockSubs(prev=>prev.includes(v.id)?prev.filter(id=>id!==v.id):[...prev,v.id]);notify(restockSubs.includes(v.id)?'Suscripción cancelada':'Aviso de reposición activado');}}><Text style={{color:C.blue,fontWeight:'800'}}>{restockSubs.includes(v.id)?'Cancelar aviso':'Avisarme cuando haya stock'}</Text></Pressable>:<Text style={{color:C.green,fontWeight:'800'}}>Disponible</Text>}</View>)}</View>)}
                <TextInput style={s.input} placeholder="ID de variante para reponer (demo)" value={manualRestock} onChangeText={setManualRestock}/><Pressable style={s.btnBlue} onPress={()=>{const product=products.find(p=>p.variants.some(v=>v.id===manualRestock.trim()));if(!product)return Alert.alert('Variante no encontrada','Escribe un ID de variante válido.');const variant=product.variants.find(v=>v.id===manualRestock.trim());const variants=product.variants.map(v=>v.id===variant.id?{...v,stock:v.stock+3}:v);setProducts(prev=>prev.map(p=>p.id===product.id?{...p,variants,stock:variants.reduce((a,v)=>a+v.stock,0)}:p));if(restockSubs.includes(variant.id))pushNotice(`restock-${variant.id}-${Date.now()}`,`${product.nombre} (${variant.etiqueta}) volvió a tener existencias. Reposición simulada.`);setManualRestock('');notify('Reposición simulada: +3 unidades');}}><Text style={s.btnTxt}>Simular reposición (+3)</Text></Pressable>
              </>}
              {featureSection === 'ayuda' && <>
                <Text style={s.bold13}>Crear solicitud de soporte</Text><Text style={s.muted}>Selecciona un pedido y describe el inconveniente (mínimo 15 caracteres).</Text>
                <View style={[s.rowGap,{flexWrap:'wrap',marginVertical:8}]}>{orders.map(o=><Pressable key={o.code} style={[s.sortBtn,supportOrder===o.code&&s.sortOn]} onPress={()=>setSupportOrder(o.code)}><Text style={s.sortTxt}>{o.code}</Text></Pressable>)}</View>
                <View style={[s.rowGap,{marginBottom:8}]}>{['Entrega','Producto','Otro'].map(r=><Pressable key={r} style={[s.sortBtn,supportReason===r&&s.sortOn]} onPress={()=>setSupportReason(r)}><Text style={s.sortTxt}>{r}</Text></Pressable>)}</View>
                <TextInput style={[s.input,{height:90,textAlignVertical:'top'}]} multiline placeholder="Describe tu solicitud..." value={supportDescription} onChangeText={setSupportDescription}/>
                <Pressable style={s.btnBlue} onPress={()=>{if(!supportOrder||supportDescription.trim().length<15)return Alert.alert('Validación','Selecciona un pedido y escribe mínimo 15 caracteres.');const ticket={id:'CASO-'+Date.now(),order:supportOrder,reason:supportReason,description:supportDescription.trim(),status:'Abierto'};setSupportCases(prev=>[ticket,...prev]);setSupportDescription('');notify('Solicitud registrada');}}><Text style={s.btnTxt}>Enviar solicitud</Text></Pressable>
                {supportCases.map(c=><View key={c.id} style={s.boxCard}><Text style={s.bold13}>{c.id} · {c.status}</Text><Text>{c.order} · {c.reason}</Text><Text>{c.description}</Text>{c.status==='Abierto'&&<Pressable onPress={()=>setSupportCases(prev=>prev.map(x=>x.id===c.id?{...x,status:'Respondido',response:'Respuesta ficticia: recibimos tu solicitud y estamos revisando el caso.'}:x))}><Text style={{color:C.blue,fontWeight:'800',marginTop:8}}>Simular respuesta</Text></Pressable>}{!!c.response&&<Text style={s.muted}>{c.response}</Text>}</View>)}
              </>}
              {featureSection!=='menu'&&<Pressable style={s.btnDark} onPress={()=>setFeatureSection('menu')}><Text style={s.btnTxt}>← Volver a Marketplace 2.0</Text></Pressable>}
            </ScrollView>
          </View>
        ) : (
          /* 6. PANEL VENDEDOR (HU18) */
          <View style={s.f1}>
            <Header title="Panel de Vendedor" />
            <ScrollView style={s.pad}>
              <View style={s.boxCard}>
                <Text style={[s.h2, { marginBottom: 8 }]}>{editId ? `Editando ${editId}` : 'Crear Producto'}</Text>
                <TextInput style={s.input} placeholder="Nombre *" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {CATS.filter((c) => c.k !== 'Todas').map((c) => (
                    <Pressable key={c.k} style={[s.sortBtn, { marginRight: 6 }, form.categoria === c.k && s.sortOn]} onPress={() => setForm({ ...form, categoria: c.k })}>
                      <Text style={[s.sortTxt, form.categoria === c.k && { color: C.blue }]}>{c.i} {c.k}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <View style={s.rowGap}>
                  <TextInput style={[s.input, s.f1]} placeholder="Precio COP *" keyboardType="numeric" value={form.precio} onChangeText={(v) => setForm({ ...form, precio: v })} />
                  <TextInput style={[s.input, s.f1]} placeholder="Stock *" keyboardType="numeric" value={form.stock} onChangeText={(v) => setForm({ ...form, stock: v })} />
                  <TextInput style={[s.input, { width: 55, textAlign: 'center' }]} placeholder="🏅" value={form.icon} onChangeText={(v) => setForm({ ...form, icon: v })} />
                </View>
                <TextInput style={s.input} placeholder="Descripción (mín. 15 caracteres) *" value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} />
                <Pressable style={s.btnBlue} onPress={saveSellerProduct}><Text style={s.btnTxt}>{editId ? 'Actualizar' : 'Guardar Producto'}</Text></Pressable>
              </View>
              <Text style={[s.h2, { marginVertical: 10 }]}>Inventario (Toca para editar)</Text>
              {products.map((p) => (
                <Pressable key={p.id} style={s.listCard} onPress={() => { setEditId(p.id); setForm({ nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), stock: String(p.stock), descripcion: p.descripcion, icon: p.icon }); }}>
                  <Text style={{ fontSize: 24, marginRight: 10 }}>{p.icon}</Text>
                  <View style={s.f1}><Text style={s.bold13}>{p.nombre}</Text><Text style={s.smallMuted}>{p.categoria} • Stock: {p.stock}</Text></View>
                  <Text style={s.price}>{cop(p.precio)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* BARRA INFERIOR DE NAVEGACIÓN (Bocetos 1 y 3) */}
      <View style={s.nav}>
        {[
          { k: 'home', l: 'Inicio', i: '🏠' },
          { k: 'favorites', l: 'Favoritos', i: '🤍' },
          { k: 'cart', l: 'Carrito', i: '🛒', b: totalUnits },
          { k: 'history', l: 'Historial', i: '🕒' },
          { k: 'features', l: 'Más', i: '✨' },
        ].map((n) => (
          <Pressable key={n.k} style={{ alignItems: 'center' }} onPress={() => { setDetailId(null); setTab(n.k); }}>
            <View>
              <Text style={{ fontSize: 20 }}>{n.i}</Text>
              {!!n.b && <View style={s.navBadge}><Text style={s.badgeTxt}>{n.b}</Text></View>}
            </View>
            <Text style={[s.navTxt, tab === n.k && !detailId && { color: C.blue, fontWeight: '800' }]}>{n.l}</Text>
          </Pressable>
        ))}
      </View>

      {/* MODAL CHECKOUT (HU12 y HU13) */}
      <Modal visible={checkoutOpen} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.rowBetween}>
              <Text style={s.h2}>{step === 'form' ? 'Datos de Entrega' : 'Confirmar Pedido'}</Text>
              <Pressable onPress={() => setCheckoutOpen(false)}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
            </View>
            {step === 'form' ? (
              <View style={{ marginTop: 10 }}>
                <Text style={s.notice}>ℹ️ Simulación académica: No ingreses tarjetas ni datos reales.</Text>
                <TextInput style={s.input} placeholder="Nombre completo *" value={buyer.name} onChangeText={(v) => setBuyer({ ...buyer, name: v })} />
                <TextInput style={s.input} placeholder="Teléfono *" keyboardType="phone-pad" value={buyer.phone} onChangeText={(v) => setBuyer({ ...buyer, phone: v })} />
                <TextInput style={s.input} placeholder="Municipio *" value={buyer.city} onChangeText={(v) => setBuyer({ ...buyer, city: v })} />
                <TextInput style={s.input} placeholder="Dirección *" value={buyer.address} onChangeText={(v) => setBuyer({ ...buyer, address: v })} />
                <Pressable style={s.btnBlue} onPress={() => {
                  if (!buyer.name.trim() || !buyer.phone.trim() || !buyer.city.trim() || !buyer.address.trim()) return Alert.alert('Campos obligatorios', 'Completa todos los datos de entrega.');
                  setStep('summary');
                }}><Text style={s.btnTxt}>Revisar resumen →</Text></Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                <Text style={s.bold13}>👤 {buyer.name} • 📞 {buyer.phone}</Text>
                <Text style={s.muted}>📍 {buyer.city} - {buyer.address}</Text>
                <View style={s.hr} />
                {cartDetailed.map((i) => <Text key={i.p.id}>• {i.q}x {i.p.nombre} ({cop(i.line)})</Text>)}
                <View style={s.hr} />
                <Text style={s.bold13}>Dirección de entrega</Text>
                {addresses.map(a=><Pressable key={a.id} style={[s.listCard,selectedAddress===a.id&&{borderWidth:2,borderColor:C.blue}]} onPress={()=>setSelectedAddress(a.id)}><Text style={s.f1}>{a.alias} · {a.city}</Text><Text>{selectedAddress===a.id?'✓':'Elegir'}</Text></Pressable>)}
                <Text style={s.bold13}>Modalidad de envío</Text><View style={s.rowGap}><Pressable style={[s.sortBtn,shippingMode==='estandar'&&s.sortOn]} onPress={()=>setShippingMode('estandar')}><Text style={s.sortTxt}>Estándar</Text></Pressable><Pressable style={[s.sortBtn,shippingMode==='express'&&s.sortOn]} onPress={()=>setShippingMode('express')}><Text style={s.sortTxt}>Exprés</Text></Pressable></View>
                <Text style={s.muted}>{currentRate?`Envío: ${cop(dynamicShipping)} · ${currentRate.days}`:'Municipio sin tarifa configurada'}</Text>
                <Text style={s.bigPrice}>Total a pagar: {cop(dynamicTotal)}</Text>
                <View style={[s.rowGap, { marginTop: 12 }]}>
                  <Pressable style={[s.btnDark, s.f1]} onPress={() => setStep('form')}><Text style={s.btnTxt}>← Editar</Text></Pressable>
                  <Pressable style={[s.btnBlue, s.f1]} onPress={confirmOrder}><Text style={s.btnTxt}>Confirmar</Text></Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL DETALLE HISTORIAL (HU15) */}
      <Modal visible={!!orderModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modal}>
            {orderModal && (
              <>
                <View style={s.rowBetween}><Text style={s.h2}>Pedido #{orderModal.code}</Text><Pressable onPress={() => setOrderModal(null)}><Text style={{ fontSize: 18 }}>✕</Text></Pressable></View>
                <Text style={s.smallMuted}>{orderModal.date} • {orderModal.buyer.name}</Text>
                <View style={s.hr} />
                {orderModal.items.map((x, idx) => <Text key={idx}>{x.icon} {x.nombre} x{x.q} — {cop(x.line)}</Text>)}
                <View style={s.hr} />
                <Text>Envío: {cop(orderModal.shipping)} | Total: <Text style={s.bold13}>{cop(orderModal.total)}</Text></Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// ESTILOS COMPACTOS EN FILA (SINGLE-LINE STYLES)
// ============================================================================
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.dark, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  f1: { flex: 1 },
  body: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topHeader: { backgroundColor: C.dark, padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  logo: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center' },
  logoTxt: { color: C.dark, fontSize: 20, fontWeight: '900' },
  brand: { color: C.white, fontSize: 17, fontWeight: '900' },
  slogan: { color: '#94A3B8', fontSize: 11 },
  adminChip: { backgroundColor: C.cardDark, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: C.blue },
  badge: { position: 'absolute', top: -2, right: -4, backgroundColor: C.red, borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeTxt: { color: C.white, fontSize: 9, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 12, height: 40, marginVertical: 12 },
  catCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.cardDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1E3A5F', marginBottom: 4 },
  catTxt: { color: '#CBD5E1', fontSize: 11, fontWeight: '600' },
  banner: { margin: 16, backgroundColor: C.dark, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: C.blue },
  bannerTitle: { color: C.white, fontSize: 14, fontWeight: '900', marginBottom: 3 },
  bannerBtn: { backgroundColor: C.blue, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
  h1: { fontSize: 21, fontWeight: '900', color: C.text },
  h2: { fontSize: 16, fontWeight: '800', color: C.text },
  bold13: { fontSize: 13, fontWeight: '800', color: C.text },
  bold16: { fontSize: 16, fontWeight: '800', color: C.text },
  whiteBold: { color: C.white, fontWeight: '800' },
  muted: { fontSize: 13, color: C.muted },
  smallMuted: { fontSize: 11, color: C.muted },
  mutedBold: { fontSize: 13, color: C.muted, fontWeight: '700' },
  sortBtn: { backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  sortOn: { backgroundColor: C.dark, borderColor: C.dark },
  sortTxt: { fontSize: 11, fontWeight: '700', color: C.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  card: { width: '48%', backgroundColor: C.white, borderRadius: 14, padding: 10, marginBottom: 12, elevation: 2 },
  favIcon: { position: 'absolute', top: 8, right: 8, zIndex: 5, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 12, padding: 3 },
  cardImg: { height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  price: { fontSize: 15, fontWeight: '900', color: C.dark, marginVertical: 4 },
  bigPrice: { fontSize: 23, fontWeight: '900', color: C.dark },
  addBtn: { backgroundColor: C.blue, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  subHeader: { backgroundColor: C.dark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.cardDark, justifyContent: 'center', alignItems: 'center' },
  subTitle: { color: C.white, fontSize: 16, fontWeight: '800' },
  detailImg: { height: 190, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  catBadge: { alignSelf: 'flex-start', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginVertical: 8 },
  catBadgeTxt: { color: C.dark, fontSize: 12, fontWeight: '700' },
  desc: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 14 },
  qtyBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, height: 44 },
  step: { fontSize: 20, fontWeight: '800', color: C.dark, paddingHorizontal: 8 },
  favSq: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  btnDark: { backgroundColor: C.dark, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnBlue: { backgroundColor: C.blue, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnTxt: { color: C.white, fontSize: 15, fontWeight: '800' },
  off: { opacity: 0.45 },
  boxCard: { backgroundColor: C.white, borderRadius: 14, padding: 14, marginTop: 12 },
  starBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: C.bg },
  miniDarkBtn: { marginLeft: 'auto', backgroundColor: C.dark, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 10, marginBottom: 10 },
  thumb: { width: 56, height: 56, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  miniStep: { width: 26, height: 26, borderRadius: 6, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  input: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, height: 42, marginBottom: 10, color: C.text },
  applyBtn: { backgroundColor: C.blue, borderRadius: 10, paddingHorizontal: 16, height: 42, justifyContent: 'center' },
  freeBadge: { backgroundColor: C.greenBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  hr: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 10 },
  nav: { backgroundColor: C.dark, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1E293B' },
  navBadge: { position: 'absolute', top: -4, right: -10, backgroundColor: C.red, borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  navTxt: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(9,21,38,0.7)', justifyContent: 'center', padding: 18 },
  modal: { backgroundColor: C.white, borderRadius: 16, padding: 16 },
  notice: { backgroundColor: '#E0F2FE', color: C.dark, fontSize: 12, padding: 8, borderRadius: 8, marginBottom: 10 },
  toast: { position: 'absolute', top: 48, alignSelf: 'center', backgroundColor: C.cardDark, borderColor: C.blue, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, zIndex: 99 },
  toastTxt: { color: C.white, fontSize: 12, fontWeight: '700' },
});
