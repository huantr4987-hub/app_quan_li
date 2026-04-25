import React, { useState } from 'react';
import { ArrowLeft, Printer, CheckCircle, Bluetooth } from 'lucide-react';
import { printer } from '../utils/printer';

function Checkout({ session, appState, onNavigate }) {
  const [fishWeight, setFishWeight] = useState(session.fishWeight || 0);
  const [shouldPrint, setShouldPrint] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);

  const fishSoldBack = fishWeight * appState.settings.fishBuybackPrice;
  const totalFood = session.foodItems?.reduce((sum, item) => sum + item.price, 0) || 0;
  const totalCost = session.basePrice + (session.additionalFees || 0) + totalFood;
  
  const amountDue = totalCost - session.initialCollected - fishSoldBack;
  const isReturnMoney = amountDue < 0;

  const handleConnectPrinter = async () => {
    setIsConnecting(true);
    try {
      await printer.connect();
      setPrinterConnected(true);
      alert("Đã kết nối máy in Bluetooth!");
    } catch (error) {
      alert("Không thể kết nối máy in.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleComplete = async () => {
    // Update fish weight and sold back before completing
    await appState.updateSession(session.id, { fishWeight, fishSoldBack });
    
    const finalRevenue = totalCost - fishSoldBack;
    await appState.completeSession(session.id, finalRevenue);
    
    if (shouldPrint) {
      if (printerConnected) {
        try {
          await printer.printReceipt({
            title: "HỒ CÂU GIẢI TRÍ",
            subtitle: "HÓA ĐƠN THANH TOÁN",
            rows: [
              { label: "Bill ID:", value: `#${session.id.slice(-4)}` },
              { label: "Khách:", value: session.customerName || "N/A" },
              { label: "Vé câu:", value: session.basePrice.toLocaleString() },
              { label: "Gia hạn:", value: (session.additionalFees || 0).toLocaleString() },
              { label: "Dịch vụ:", value: totalFood.toLocaleString() },
              { label: "Trừ cá:", value: `-${fishSoldBack.toLocaleString()}` },
              { label: "Tạm ứng:", value: `-${session.initialCollected.toLocaleString()}` }
            ],
            totalLabel: isReturnMoney ? "THỐI LẠI:" : "THU THÊM:",
            totalValue: Math.abs(amountDue).toLocaleString('vi-VN') + "đ",
            footer: "Cảm ơn quý khách. Hẹn gặp lại!"
          });
        } catch (e) {
          window.print();
        }
      } else {
        window.print();
      }
    }
    
    onNavigate('dashboard');
  };

  return (
    <div className="checkout-view">
      <header className="header-nav print-hide">
        <button className="btn-icon" onClick={() => onNavigate('active', session.id)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Thanh Toán</h2>
        <button 
          className={`btn-icon ${printerConnected ? 'text-green' : 'text-gold'}`} 
          onClick={handleConnectPrinter}
          disabled={isConnecting}
        >
          {isConnecting ? <Bluetooth className="animate-spin" size={24} /> : <Bluetooth size={24} />}
        </button>
      </header>

      <div className="content print-hide">
        <div className="checkout-card">
          <div className="form-group highlight-box refund-box">
            <label>Số kg {appState.settings.fishBuybackName || 'cá'} thu mua (Giá: {appState.settings.fishBuybackPrice.toLocaleString('vi-VN')}đ/kg)</label>
            <input 
              type="number" 
              className="input-field amount-input text-red" 
              value={fishWeight || ''} 
              onChange={(e) => setFishWeight(Number(e.target.value))}
              placeholder="Nhập số kg"
              step="0.1"
            />
          </div>

          <div className="summary-section mt-4">
            <h3 className="section-title">Tổng Kết Hóa Đơn</h3>
            <ul className="item-list summary-list">
              <li>
                <span>Tiền vé câu ({session.durationHours - (session.addedTime || 0)}h)</span>
                <span>{session.basePrice.toLocaleString('vi-VN')} đ</span>
              </li>
              {(session.additionalFees > 0) && (
                <li>
                  <span>Tiền gia hạn ({session.addedTime}h)</span>
                  <span>{session.additionalFees.toLocaleString('vi-VN')} đ</span>
                </li>
              )}
              {totalFood > 0 && (
                <li>
                  <span>Đồ ăn / Thức uống</span>
                  <span>{totalFood.toLocaleString('vi-VN')} đ</span>
                </li>
              )}
              <li className="text-red font-bold">
                <span>Cá bán lại ({fishWeight}kg)</span>
                <span>- {fishSoldBack.toLocaleString('vi-VN')} đ</span>
              </li>
              <li className="total-row">
                <span>TỔNG CHI PHÍ</span>
                <span>{(totalCost - fishSoldBack).toLocaleString('vi-VN')} đ</span>
              </li>
              <li className="font-bold highlight-row">
                <span>Đã tạm thu</span>
                <span>{session.initialCollected.toLocaleString('vi-VN')} đ</span>
              </li>
              
              <li className={`final-due-row ${isReturnMoney ? 'return' : 'collect'}`}>
                <span>{isReturnMoney ? 'SỐ TIỀN THỐI LẠI KHÁCH' : 'SỐ TIỀN THU THÊM'}</span>
                <span>{Math.abs(amountDue).toLocaleString('vi-VN')} đ</span>
              </li>
            </ul>
          </div>

          <div className="print-toggle-area mt-4">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={shouldPrint} 
                onChange={(e) => setShouldPrint(e.target.checked)} 
              />
              <span className="checkmark"></span>
              In hóa đơn khi hoàn tất
            </label>
          </div>

          <button className="btn btn-primary btn-block mt-4 btn-large gold-btn" onClick={handleComplete}>
            <CheckCircle size={20} className="mr-2" /> HOÀN TẤT & {shouldPrint ? 'IN BILL' : 'LƯU APP'}
          </button>
        </div>
      </div>

      {/* Receipt Layout for Browser Printing */}
      <div className="print-only receipt">
        <h2 className="text-center">HỒ CÂU GIẢI TRÍ</h2>
        <h3 className="text-center">HÓA ĐƠN THANH TOÁN</h3>
        <hr/>
        <div className="receipt-row"><span>Bill ID:</span> <span>#{session.id.slice(-4)}</span></div>
        <div className="receipt-row"><span>Thời gian:</span> <span>{new Date().toLocaleString('vi-VN')}</span></div>
        {session.customerName && <div className="receipt-row"><span>Khách:</span> <span>{session.customerName}</span></div>}
        {session.customerPhone && <div className="receipt-row"><span>SĐT:</span> <span>{session.customerPhone}</span></div>}
        <hr/>
        <div className="receipt-row"><span>Vé câu:</span> <span>{session.basePrice.toLocaleString('vi-VN')}</span></div>
        {(session.additionalFees > 0) && <div className="receipt-row"><span>Gia hạn:</span> <span>{session.additionalFees.toLocaleString('vi-VN')}</span></div>}
        
        {session.foodItems?.map(item => (
          <div className="receipt-row" key={item.id}><span>{item.name}:</span> <span>{item.price.toLocaleString('vi-VN')}</span></div>
        ))}
        
        {fishSoldBack > 0 && <div className="receipt-row font-bold"><span>Trừ cá ({fishWeight}kg):</span> <span>-{fishSoldBack.toLocaleString('vi-VN')}</span></div>}
        <hr/>
        <div className="receipt-row font-bold"><span>TỔNG CỘNG:</span> <span>{(totalCost - fishSoldBack).toLocaleString('vi-VN')} đ</span></div>
        <div className="receipt-row"><span>Đã tạm ứng:</span> <span>{session.initialCollected.toLocaleString('vi-VN')} đ</span></div>
        <hr/>
        <div className="receipt-row text-lg font-bold">
          <span>{isReturnMoney ? 'Thối lại khách:' : 'Khách đưa thêm:'}</span> 
          <span>{Math.abs(amountDue).toLocaleString('vi-VN')} đ</span>
        </div>
        <p className="text-center mt-4 text-sm">Cảm ơn quý khách. Hẹn gặp lại!</p>
      </div>
    </div>
  );
}

export default Checkout;
