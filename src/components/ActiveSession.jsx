import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

function ActiveSession({ session, appState, onNavigate }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = session.startTime + session.durationHours * 3600000;
      const difference = endTime - Date.now();

      if (difference > 0) {
        setTimeLeft(difference);
        // Warning when less than 15 mins (900000 ms)
        setIsWarning(difference <= 900000);
      } else {
        setTimeLeft(0);
        setIsWarning(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [session.startTime, session.durationHours]);

  const formatTime = (ms) => {
    if (ms <= 0) return "HẾT GIỜ";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = appState.products.find(p => p.id === selectedProductId);
    if (!product) return;

    const newFoodItem = { name: product.name, price: product.price, id: Date.now() };
    const updatedFoods = [...(session.foodItems || []), newFoodItem];
    appState.updateSession(session.id, { foodItems: updatedFoods });
    setSelectedProductId('');
    setShowAddFood(false);
  };

  const handleExtend = () => {
    const extraHours = parseFloat(prompt("Nhập số giờ muốn gia hạn thêm:", "1"));
    if (isNaN(extraHours) || extraHours <= 0) return;
    const defaultPrice = extraHours * appState.settings.defaultPondPrice;
    const extraPrice = parseFloat(prompt(`Nhập số tiền cho ${extraHours} giờ:`, defaultPrice.toString()));
    if (isNaN(extraPrice) || extraPrice < 0) return;

    appState.updateSession(session.id, {
      durationHours: session.durationHours + extraHours,
      addedTime: (session.addedTime || 0) + extraHours,
      additionalFees: (session.additionalFees || 0) + extraPrice
    });
  };

  return (
    <div className="active-session">
      <header className="header-nav">
        <button className="btn-icon" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Phiên Câu #{session.id.slice(-4)} {session.customerPhone && `(${session.customerPhone})`}</h2>
      </header>

      <div className="content">
        <div className={`timer-card ${isWarning ? 'warning' : ''}`}>
          <h3>Thời gian còn lại</h3>
          <div className="timer-display">
            {isWarning && <AlertTriangle className="warning-icon" size={32} />}
            {formatTime(timeLeft)}
          </div>
          {isWarning && timeLeft > 0 && <p className="warning-text">Sắp hết giờ!</p>}
          {timeLeft === 0 && <p className="danger-text">Đã hết giờ câu!</p>}
        </div>

        <div className="action-grid mt-4">
          <button className="action-btn" onClick={handleExtend}>
            <Clock size={24} />
            <span>Gia hạn giờ</span>
          </button>
          <button className="action-btn" onClick={() => setShowAddFood(!showAddFood)}>
            <Plus size={24} />
            <span>Thêm đồ ăn</span>
          </button>
          <button className="action-btn primary" onClick={() => onNavigate('checkout', session.id)}>
            <CheckSquare size={24} />
            <span>Thanh toán</span>
          </button>
        </div>

        {showAddFood && (
          <div className="form-card mt-4">
            <h3>Chọn Sản Phẩm / Dịch Vụ</h3>
            <div className="form-group">
              <select 
                className="input-field" 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {appState.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString('vi-VN')}đ</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleAddProduct}>Thêm vào bill</button>
          </div>
        )}

        <div className="session-details mt-4">
          <h3>Chi tiết hóa đơn tạm tính</h3>
          <ul className="item-list">
            <li>
              <span>Vé câu ({session.durationHours - (session.addedTime || 0)}h)</span>
              <span>{session.basePrice.toLocaleString('vi-VN')} đ</span>
            </li>
            {session.additionalFees > 0 && (
              <li>
                <span>Phí gia hạn ({session.addedTime}h)</span>
                <span>{session.additionalFees.toLocaleString('vi-VN')} đ</span>
              </li>
            )}
            {session.foodItems?.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>{item.price.toLocaleString('vi-VN')} đ</span>
              </li>
            ))}
            <li className="font-bold highlight-row">
              <span>Đã thu (Tạm ứng)</span>
              <span>- {session.initialCollected.toLocaleString('vi-VN')} đ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ActiveSession;
