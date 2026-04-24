import React, { useState, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

function CreateSession({ appState, onNavigate }) {
  const [durationHours, setDurationHours] = useState(5);
  const [basePrice, setBasePrice] = useState(appState.settings.defaultPondPrice * 5);
  const [initialCollected, setInitialCollected] = useState(appState.settings.defaultPondPrice * 5);
  const [customerPhone, setCustomerPhone] = useState('');

  const pricePresets = [
    { hours: 1, price: appState.settings.defaultPondPrice * 1 },
    { hours: 5, price: appState.settings.defaultPondPrice * 5 },
    { hours: 10, price: appState.settings.defaultPondPrice * 10 },
  ];

  const handleStart = () => {
    // Save customer if phone provided
    let customerId = null;
    if (customerPhone) {
      customerId = appState.saveCustomer({ phone: customerPhone, name: '' });
    }

    const session = appState.createSession({
      durationHours,
      basePrice,
      initialCollected,
      customerPhone,
      customerId,
      createdAt: Date.now()
    });
    
    // Simulate printing initial bill
    window.print();

    onNavigate('active', session.id);
  };

  return (
    <div className="create-session">
      <header className="header-nav">
        <button className="btn-icon" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Tạo Bill Mới</h2>
      </header>

      <div className="content form-container">
        <div className="form-group">
          <label>Số điện thoại khách (Tùy chọn)</label>
          <input 
            type="tel" 
            className="input-field" 
            placeholder="Nhập SĐT để tích điểm/lưu thông tin"
            value={customerPhone} 
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Chọn giờ câu</label>
          <div className="presets-grid">
            {pricePresets.map(preset => (
              <button 
                key={preset.hours}
                className={`preset-btn ${durationHours === preset.hours ? 'selected' : ''}`}
                onClick={() => {
                  setDurationHours(preset.hours);
                  setBasePrice(preset.price);
                  setInitialCollected(preset.price); // Default suggest full price
                }}
              >
                {preset.hours} Tiếng
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Hoặc nhập giờ tùy chỉnh</label>
          <input 
            type="number" 
            className="input-field" 
            value={durationHours} 
            onChange={(e) => setDurationHours(Number(e.target.value))}
            min="0.5" step="0.5"
          />
        </div>

        <div className="form-group">
          <label>Giá tiền vé (VNĐ)</label>
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

        <div className="form-group highlight-box">
          <label>Tiền khách đưa (Tạm thu)</label>
          <input 
            type="number" 
            className="input-field amount-input" 
            value={initialCollected} 
            onChange={(e) => setInitialCollected(Number(e.target.value))}
          />
        </div>

        <button className="btn btn-primary btn-block mt-4" onClick={handleStart}>
          <Printer size={20} className="mr-2" /> BẮT ĐẦU & IN BILL TẠM THU
        </button>
      </div>

      {/* Hidden print area for the receipt */}
      <div className="print-only receipt">
        <h2 className="text-center">HỒ CÂU GIẢI TRÍ</h2>
        <h3 className="text-center">BILL TẠM THU</h3>
        <hr/>
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
