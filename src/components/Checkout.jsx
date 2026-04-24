import React, { useState } from 'react';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';

function Checkout({ session, appState, onNavigate }) {
  const [fishWeight, setFishWeight] = useState(session.fishWeight || 0);

  const fishSoldBack = fishWeight * appState.settings.fishBuybackPrice;

  const totalFood = session.foodItems?.reduce((sum, item) => sum + item.price, 0) || 0;
  const totalCost = session.basePrice + (session.additionalFees || 0) + totalFood;
  
  // Final amount to pay (or return)
  // Positive means customer needs to pay more. Negative means we return money to customer.
  const amountDue = totalCost - session.initialCollected - fishSoldBack;
  const isReturnMoney = amountDue < 0;

  const handleComplete = () => {
    // Update fish weight and sold back before completing
    appState.updateSession(session.id, { fishWeight, fishSoldBack });
    // Final amount added to revenue (Total cost - fish sold back)
    // Actually revenue is the money we keep.
    const finalRevenue = totalCost - fishSoldBack;
    appState.completeSession(session.id, finalRevenue);
    
    window.print();
    onNavigate('dashboard');
  };

  return (
    <div className="checkout-view">
      <header className="header-nav print-hide">
        <button className="btn-icon" onClick={() => onNavigate('active', session.id)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Thanh Toán</h2>
      </header>

      <div className="content print-hide">
        <div className="checkout-card">
          <div className="form-group highlight-box refund-box">
            <label>Số kg {appState.settings.fishBuybackName || 'cá'} thu mua lại (Giá: {appState.settings.fishBuybackPrice.toLocaleString('vi-VN')}đ/kg)</label>
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
            <h3>Tổng Kết Hóa Đơn</h3>
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

          <button className="btn btn-primary btn-block mt-4 btn-large" onClick={handleComplete}>
            <CheckCircle size={20} className="mr-2" /> HOÀN TẤT & IN BILL
          </button>
        </div>
      </div>

      {/* Receipt Layout for Printing */}
      <div className="print-only receipt">
        <h2 className="text-center">HỒ CÂU GIẢI TRÍ</h2>
        <h3 className="text-center">HÓA ĐƠN THANH TOÁN</h3>
        <hr/>
        <div className="receipt-row"><span>Bill ID:</span> <span>#{session.id.slice(-4)}</span></div>
        <div className="receipt-row"><span>Thời gian:</span> <span>{new Date().toLocaleString('vi-VN')}</span></div>
        {session.customerPhone && <div className="receipt-row"><span>SĐT:</span> <span>{session.customerPhone}</span></div>}
        <hr/>
        <div className="receipt-row"><span>Vé câu ({session.durationHours - (session.addedTime || 0)}h):</span> <span>{session.basePrice.toLocaleString('vi-VN')}</span></div>
        {(session.additionalFees > 0) && <div className="receipt-row"><span>Gia hạn ({session.addedTime}h):</span> <span>{session.additionalFees.toLocaleString('vi-VN')}</span></div>}
        
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
