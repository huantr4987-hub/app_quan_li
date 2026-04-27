import React, { useState } from 'react';
import { ArrowLeft, Printer, Bluetooth, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { printer } from '../utils/printer';
import toast from 'react-hot-toast';

function CreateSession({ appState, onNavigate }) {
  const [durationHours, setDurationHours] = useState(5);
  const [basePrice, setBasePrice] = useState(appState.settings.defaultPondPrice * 5);
  const [initialCollected, setInitialCollected] = useState(appState.settings.defaultPondPrice * 5);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [shouldPrint, setShouldPrint] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricePresets = [
    { hours: 1, price: appState.settings.defaultPondPrice * 1 },
    { hours: 5, price: appState.settings.defaultPondPrice * 5 },
    { hours: 10, price: appState.settings.defaultPondPrice * 10 },
  ];

  React.useEffect(() => {
    const productsTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    setInitialCollected(basePrice + productsTotal);
  }, [basePrice, selectedProducts]);

  const handleConnectPrinter = async () => {
    setIsConnecting(true);
    const tId = toast.loading("Đang kết nối máy in Bluetooth...");
    try {
      await printer.connect();
      setPrinterConnected(true);
      toast.success("Đã kết nối máy in!", { id: tId });
    } catch (error) {
      toast.error("Không thể kết nối máy in. Vui lòng kiểm tra Bluetooth.", { id: tId });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStart = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const tId = toast.loading("Đang tạo ca câu mới...");

    try {
      // Save customer if phone provided
      let customerId = null;
      if (customerPhone) {
        customerId = await appState.saveCustomer({ phone: customerPhone, name: customerName });
      }

      const session = await appState.createSession({
        durationHours,
        basePrice,
        initialCollected,
        customerPhone,
        customerName,
        customerId,
        foodItems: selectedProducts,
        createdAt: Date.now()
      });
      
      if (shouldPrint) {
        if (printerConnected) {
          try {
            const productRows = selectedProducts.map(p => ({ label: p.name + ":", value: p.price.toLocaleString('vi-VN') + "đ" }));
            await printer.printReceipt({
              title: "HỒ CÂU GIẢI TRÍ",
              subtitle: "BILL TẠM THU",
              rows: [
                { label: "SĐT:", value: customerPhone || "N/A" },
                { label: "Tên:", value: customerName || "N/A" },
                { label: "Giờ câu:", value: `${durationHours}h` },
                { label: "Giá vé:", value: basePrice.toLocaleString('vi-VN') + "đ" },
                ...productRows,
                { label: "Thời gian:", value: new Date().toLocaleTimeString('vi-VN') }
              ],
              totalLabel: "TỔNG THU:",
              totalValue: initialCollected.toLocaleString('vi-VN') + "đ",
              footer: "Chúc quý khách câu may mắn!"
            });
            toast.success("Đã tạo ca & In bill!", { id: tId });
            onNavigate('active_list');
          } catch (e) {
            console.error("Bluetooth print failed, falling back to browser print", e);
            toast.success("Đã tạo ca! Đang mở giao diện in...", { id: tId });
            setTimeout(() => {
              window.print();
              onNavigate('active_list');
            }, 300);
          }
        } else {
          toast.success("Đã tạo ca! Đang mở giao diện in...", { id: tId });
          setTimeout(() => {
            window.print();
            onNavigate('active_list');
          }, 300);
        }
      } else {
        toast.success("Khởi tạo ca câu thành công!", { id: tId });
        onNavigate('active_list');
      }

    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", { id: tId });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-session">
      <header className="header-nav print-hide">
        <button className="btn-icon" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Tạo Bill Mới</h2>
        <button 
          className={`btn-icon ${printerConnected ? 'text-green' : 'text-gold'}`} 
          onClick={handleConnectPrinter}
          disabled={isConnecting}
        >
          {isConnecting ? <Bluetooth className="animate-spin" size={24} /> : <Bluetooth size={24} />}
        </button>
      </header>

      <div className="content form-container print-hide">
        <div className="form-card highlight-card mb-4">
          <div className="form-group">
            <label>Tên khách hàng</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nhập tên khách"
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="Nhập số điện thoại"
              value={customerPhone} 
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group mt-4">
          <label>Chọn giờ câu</label>
          <div className="presets-grid">
            {pricePresets.map(preset => (
              <button 
                key={preset.hours}
                className={`preset-btn ${durationHours === preset.hours ? 'selected' : ''}`}
                onClick={() => {
                  setDurationHours(preset.hours);
                  setBasePrice(preset.price);
                  setInitialCollected(preset.price);
                }}
              >
                {preset.hours} Tiếng
              </button>
            ))}
          </div>
        </div>

        <div className="action-grid-two mt-4">
          <div className="form-group">
            <label>Giờ tùy chỉnh</label>
            <input 
              type="number" 
              className="input-field" 
              value={durationHours} 
              onChange={(e) => setDurationHours(Number(e.target.value))}
              min="0.5" step="0.5"
            />
          </div>
          <div className="form-group">
            <label>Giá vé (VNĐ)</label>
            <input 
              type="number" 
              className="input-field" 
              value={basePrice} 
              onChange={(e) => setBasePrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-card highlight-card mt-4">
          <h3 className="section-title" style={{ fontSize: '0.85rem' }}>Thêm Dịch Vụ Trước Khi Câu</h3>
          <div className="presets-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {appState.products.map(p => (
              <button 
                key={p.id}
                className="preset-btn"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 5px', height: 'auto', gap: '4px' }}
                onClick={() => {
                  setSelectedProducts([...selectedProducts, { ...p, cartId: Date.now() + Math.random() }]);
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)' }}>{p.price.toLocaleString('vi-VN')}đ</span>
              </button>
            ))}
          </div>
          {selectedProducts.length > 0 && (
            <ul className="item-list mt-2" style={{ padding: '0 10px', background: '#f8fafc', borderRadius: '8px' }}>
              {selectedProducts.map(item => (
                <li key={item.cartId} style={{ padding: '8px 0', fontSize: '0.85rem' }}>
                  <span>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="font-bold">{item.price.toLocaleString('vi-VN')}đ</span>
                    <button className="btn-icon" style={{ padding: 2, color: '#ef4444' }} onClick={() => setSelectedProducts(selectedProducts.filter(p => p.cartId !== item.cartId))}>
                      <XCircle size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group highlight-box mt-4">
          <label>Tổng Thu Trước (Vé + Dịch vụ)</label>
          <input 
            type="number" 
            className="input-field amount-input" 
            value={initialCollected} 
            onChange={(e) => setInitialCollected(Number(e.target.value))}
            style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}
          />
        </div>

        <div className="print-toggle-area mt-4">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={shouldPrint} 
              onChange={(e) => setShouldPrint(e.target.checked)} 
            />
            <span className="checkmark"></span>
            Tự động in Bill khi bắt đầu
          </label>
        </div>

        <button className="btn btn-primary btn-block mt-4 btn-large gold-btn" onClick={handleStart}>
          <Printer size={20} className="mr-2" /> BẮT ĐẦU & {shouldPrint ? 'IN BILL' : 'LƯU APP'}
        </button>
      </div>

      {/* Hidden print area for Browser Printing fallback */}
      <div className="print-only receipt">
        <h2 className="text-center">HỒ CÂU GIẢI TRÍ</h2>
        <h3 className="text-center">BILL TẠM THU</h3>
        <hr/>
        {customerName && <div className="receipt-row"><span>Khách:</span> <span>{customerName}</span></div>}
        {customerPhone && <div className="receipt-row"><span>SĐT:</span> <span>{customerPhone}</span></div>}
        <div className="receipt-row"><span>Thời gian:</span> <span>{new Date().toLocaleString('vi-VN')}</span></div>
        <div className="receipt-row"><span>Giờ câu:</span> <span>{durationHours} tiếng</span></div>
        <div className="receipt-row"><span>Giá vé:</span> <span>{basePrice.toLocaleString('vi-VN')} đ</span></div>
        {selectedProducts.length > 0 && <hr style={{ borderStyle: 'dashed', margin: '4px 0' }}/>}
        {selectedProducts.map(p => (
          <div key={p.cartId} className="receipt-row">
            <span>{p.name}:</span>
            <span>{p.price.toLocaleString('vi-VN')} đ</span>
          </div>
        ))}
        <hr/>
        <div className="receipt-row font-bold"><span>TỔNG TẠM THU:</span> <span>{initialCollected.toLocaleString('vi-VN')} đ</span></div>
        <p className="text-center mt-4 text-sm">Chúc quý khách câu được nhiều cá!</p>
      </div>
    </div>
  );
}

export default CreateSession;
