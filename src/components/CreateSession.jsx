import React, { useState } from 'react';
import { ArrowLeft, Printer, Bluetooth, CheckCircle2, XCircle } from 'lucide-react';
import { printer } from '../utils/printer';

function CreateSession({ appState, onNavigate }) {
  const [durationHours, setDurationHours] = useState(5);
  const [basePrice, setBasePrice] = useState(appState.settings.defaultPondPrice * 5);
  const [initialCollected, setInitialCollected] = useState(appState.settings.defaultPondPrice * 5);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [shouldPrint, setShouldPrint] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);

  const pricePresets = [
    { hours: 1, price: appState.settings.defaultPondPrice * 1 },
    { hours: 5, price: appState.settings.defaultPondPrice * 5 },
    { hours: 10, price: appState.settings.defaultPondPrice * 10 },
  ];

  const handleConnectPrinter = async () => {
    setIsConnecting(true);
    try {
      await printer.connect();
      setPrinterConnected(true);
      alert("Đã kết nối máy in Bluetooth!");
    } catch (error) {
      alert("Không thể kết nối máy in. Vui lòng kiểm tra Bluetooth.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStart = async () => {
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
      createdAt: Date.now()
    });
    
    if (shouldPrint) {
      if (printerConnected) {
        try {
          await printer.printReceipt({
            title: "HỒ CÂU GIẢI TRÍ",
            subtitle: "BILL TẠM THU",
            rows: [
              { label: "SĐT:", value: customerPhone || "N/A" },
              { label: "Tên:", value: customerName || "N/A" },
              { label: "Giờ câu:", value: `${durationHours}h` },
              { label: "Giá vé:", value: basePrice.toLocaleString('vi-VN') + "đ" },
              { label: "Thời gian:", value: new Date().toLocaleTimeString('vi-VN') }
            ],
            totalLabel: "TẠM THU:",
            totalValue: initialCollected.toLocaleString('vi-VN') + "đ",
            footer: "Chúc quý khách câu may mắn!"
          });
        } catch (e) {
          console.error("Bluetooth print failed, falling back to browser print", e);
          window.print();
        }
      } else {
        window.print();
      }
    }

    onNavigate('active', session.id);
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
              onChange={(e) => {
                setBasePrice(Number(e.target.value));
                setInitialCollected(Number(e.target.value));
              }}
            />
          </div>
        </div>

        <div className="form-group highlight-box mt-4">
          <label>Tiền khách đưa (Tạm thu)</label>
          <input 
            type="number" 
            className="input-field amount-input" 
            value={initialCollected} 
            onChange={(e) => setInitialCollected(Number(e.target.value))}
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
        <hr/>
        <div className="receipt-row font-bold"><span>TẠM THU:</span> <span>{initialCollected.toLocaleString('vi-VN')} đ</span></div>
        <p className="text-center mt-4 text-sm">Chúc quý khách câu được nhiều cá!</p>
      </div>
    </div>
  );
}

export default CreateSession;
