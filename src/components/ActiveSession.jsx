import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

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

    const tId = toast.loading(`Đang thêm ${product.name}...`);
    try {
      const newFoodItem = { name: product.name, price: product.price, id: Date.now() };
      const updatedFoods = [...(session.foodItems || []), newFoodItem];
      appState.updateSession(session.id, { foodItems: updatedFoods });
      setSelectedProductId('');
      setShowAddFood(false);
      toast.success(`Đã thêm ${product.name}!`, { id: tId });
    } catch (err) {
      toast.error("Lỗi khi thêm đồ ăn/uống!", { id: tId });
    }
  };

  const handleExtend = () => {
    const extraHours = parseFloat(prompt("Nhập số giờ muốn gia hạn thêm:", "1"));
    if (isNaN(extraHours) || extraHours <= 0) return;
    const defaultPrice = extraHours * appState.settings.defaultPondPrice;
    const extraPrice = parseFloat(prompt(`Nhập số tiền cho ${extraHours} giờ:`, defaultPrice.toString()));
    if (isNaN(extraPrice) || extraPrice < 0) return;

    const tId = toast.loading("Đang gia hạn thời gian...");
    try {
      appState.updateSession(session.id, {
        durationHours: session.durationHours + extraHours,
        addedTime: (session.addedTime || 0) + extraHours,
        additionalFees: (session.additionalFees || 0) + extraPrice
      });
      toast.success(`Đã gia hạn thêm ${extraHours} tiếng!`, { id: tId });
    } catch (err) {
      toast.error("Lỗi khi gia hạn!", { id: tId });
    }
  };

  return (
    <div className="active-session-view">
      <header className="header-nav">
        <button className="btn-icon" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={24} />
        </button>
        <div className="text-center flex-1">
          <h2 style={{fontSize: '1rem'}}>Phiên #{session.id.slice(-4)}</h2>
          <p className="subtitle" style={{color: 'white', fontSize: '0.75rem'}}>{session.customerName || session.customerPhone || 'Khách vãng lai'}</p>
        </div>
        <div style={{width: 40}}></div>
      </header>

      <div className="content">
        <div className={`timer-card glass ${isWarning ? 'warning' : ''}`}>
          <p className="timer-label">THỜI GIAN CÒN LẠI</p>
          <div className="timer-display">
            {isWarning && timeLeft > 0 && <AlertTriangle className="warning-icon" size={24} />}
            <span className={timeLeft === 0 ? 'text-red' : ''}>{formatTime(timeLeft)}</span>
          </div>
          {isWarning && timeLeft > 0 && <p className="warning-text">Sắp hết giờ!</p>}
          {timeLeft === 0 && <p className="danger-text">Đã hết giờ câu!</p>}
        </div>

        <div className="action-grid mt-4">
          <button className="action-btn glass" onClick={handleExtend}>
            <Clock size={24} className="text-gold" />
            <span>Gia hạn</span>
          </button>
          <button className="action-btn glass" onClick={() => setShowAddFood(!showAddFood)}>
            <Plus size={24} className="text-green" />
            <span>Thêm đồ</span>
          </button>
          <button className="action-btn primary gold-btn" onClick={() => onNavigate('checkout', session.id)}>
            <CheckCircle2 size={24} />
            <span>Kết thúc</span>
          </button>
        </div>

        {showAddFood && (
          <div className="form-card highlight-card mt-4">
            <h3 className="section-title">Thêm Dịch Vụ</h3>
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
            <button className="btn btn-primary btn-block" onClick={handleAddProduct}>Xác nhận thêm</button>
          </div>
        )}

        <div className="session-details-card glass mt-4">
          <h3 className="section-title p-4 pb-0">Chi tiết tạm tính</h3>
          <ul className="item-list px-4 pb-4">
            <li>
              <div className="item-info">
                <span className="item-name">Vé câu ({session.durationHours - (session.addedTime || 0)}h)</span>
              </div>
              <span className="item-price">{session.basePrice.toLocaleString('vi-VN')} đ</span>
            </li>
            {session.additionalFees > 0 && (
              <li>
                <div className="item-info">
                  <span className="item-name">Phí gia hạn ({session.addedTime}h)</span>
                </div>
                <span className="item-price">{session.additionalFees.toLocaleString('vi-VN')} đ</span>
              </li>
            )}
            {session.foodItems?.map(item => (
              <li key={item.id}>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                </div>
                <span className="item-price">{item.price.toLocaleString('vi-VN')} đ</span>
              </li>
            ))}
            <li className="total-row-lite">
              <span>Đã tạm ứng</span>
              <span className="text-gold">-{session.initialCollected.toLocaleString('vi-VN')} đ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ActiveSession;
