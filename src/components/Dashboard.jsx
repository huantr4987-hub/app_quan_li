import React, { useState } from 'react';
import { LogOut, PlusCircle, Clock, CheckCircle, TrendingUp, Fish, LayoutGrid, ClipboardList, Users, History, ShoppingBag, Trash2, Edit, BarChart3, Calendar, DollarSign, PieChart } from 'lucide-react';

function Dashboard({ appState, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Catalog state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  
  // Fish buyback settings state
  const [fishName, setFishName] = useState(appState.settings.fishBuybackName || 'Cá chung');
  const [fishPrice, setFishPrice] = useState(appState.settings.fishBuybackPrice || 20000);

  const handleUpdateFishSettings = () => {
    appState.updateSettings({
      fishBuybackName: fishName,
      fishBuybackPrice: Number(fishPrice)
    });
    alert('Đã cập nhật giá thu cá!');
  };

  const activeSessions = appState.sessions.filter(s => s.status === 'active');
  const completedSessions = appState.sessions.filter(s => s.status === 'completed');

  const todayRevenue = completedSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
  const totalTickets = completedSessions.reduce((sum, s) => sum + (s.basePrice + (s.additionalFees || 0)), 0);
  const totalFoodRevenue = completedSessions.reduce((sum, s) => {
    const foodTotal = s.foodItems?.reduce((fSum, f) => fSum + f.price, 0) || 0;
    return sum + foodTotal;
  }, 0);
  
  // Calculate cost based on weight * buyback price
  const fishCost = completedSessions.reduce((sum, s) => sum + (s.fishWeight * appState.settings.fishBuybackPrice), 0);
  const noFishSessions = completedSessions.filter(s => !s.fishWeight || s.fishWeight === 0).length;
  const fishSessions = completedSessions.filter(s => s.fishWeight > 0).length;
  const netProfit = todayRevenue - fishCost;

  const handleAddProduct = () => {
    if (!newProductName || !newProductPrice) return;
    appState.addProduct({ name: newProductName, price: Number(newProductPrice), category: 'other' });
    setNewProductName('');
    setNewProductPrice('');
  };

  return (
    <div className="dashboard-wrapper">
      {activeTab === 'dashboard' && (
        <div className="dashboard-content-area">
          <div className="dashboard-header">
            <h1>QUẢN LÝ BÁN HÀNG</h1>
            <p>Quản lý hồ câu chuyên nghiệp & Hiệu quả</p>
          </div>
          
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card-small">
                <div className="stat-icon-wrapper gold">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-label-small">DOANH SỐ NAY</div>
                <div className="stat-value-small">{todayRevenue > 0 ? (todayRevenue / 1000).toFixed(1) : '0'}k</div>
              </div>
              
              <div className="stat-card-small">
                <div className="stat-icon-wrapper green">
                  <Fish size={24} />
                </div>
                <div className="stat-label-small">ĐANG CÂU</div>
                <div className="stat-value-small" style={{color: '#059669'}}>{activeSessions.length}</div>
              </div>
            </div>

            <div className="stat-card-large">
              <div className="label green">DOANH THU THUẦN</div>
              <div className="value">{todayRevenue.toLocaleString('vi-VN')}đ</div>
              <div className="subtext">{noFishSessions} ca không có cá</div>
            </div>

            <div className="stat-card-large">
              <div className="label red">CHI PHÍ THU CÁ</div>
              <div className="value">{fishCost.toLocaleString('vi-VN')}đ</div>
              <div className="subtext">{fishSessions} ca có cá</div>
            </div>

            <div className="stat-card-large">
              <div className="label gold">LỢI NHUẬN THỰC TẾ</div>
              <div className="value">{netProfit.toLocaleString('vi-VN')}đ</div>
              <div className="subtext">Đã trừ chi phí</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="dashboard-content-area">
          <div className="header">
            <div>
              <h2>Quản Lý Ca Câu</h2>
              <p className="subtitle">Quản lý các ca đang câu</p>
            </div>
            <button className="btn-icon" onClick={appState.logout}>
              <LogOut size={20} color="white" />
            </button>
          </div>

          <div className="tab-content" style={{padding: '0 16px', marginTop: '16px'}}>
            <button className="btn btn-large btn-block" onClick={() => onNavigate('create')} style={{background: 'var(--gold-color)', color: '#000', marginBottom: '24px', fontWeight: 'bold'}}>
              <PlusCircle size={24} className="mr-2" />
              BẮT ĐẦU / TẠO BILL
            </button>

            <div className="section">
              <h3 style={{color: 'white', marginBottom: '12px'}}><Clock size={18} className="inline-icon"/> Đang câu ({activeSessions.length})</h3>
              {activeSessions.length === 0 ? (
                <div className="empty-state" style={{color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '20px 0'}}>Không có khách nào đang câu</div>
              ) : (
                <div className="session-list">
                  {activeSessions.map(session => (
                    <div key={session.id} className="session-card" onClick={() => onNavigate('active', session.id)}>
                      <div className="session-info">
                        <h4>{session.customerPhone ? `${session.customerPhone} - ` : ''}Bill #{session.id.slice(-4)}</h4>
                        <p>{session.durationHours} tiếng</p>
                      </div>
                      <div className="session-status active-badge">Đang câu</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section mt-4">
              <h3 style={{color: 'white', marginBottom: '12px'}}><CheckCircle size={18} className="inline-icon"/> Đã ngưng ({completedSessions.length})</h3>
              <div className="session-list">
                {completedSessions.map(session => (
                  <div key={session.id} className="session-card completed">
                    <div className="session-info">
                      <h4>Bill #{session.id.slice(-4)}</h4>
                      <p>Đã thanh toán</p>
                    </div>
                    <div className="session-status completed-badge">Hoàn tất</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="dashboard-content-area">
          <div className="header">
            <div>
              <h2>Sản Phẩm và Dịch Vụ</h2>
              <p className="subtitle">Mồi câu, đồ uống, thức ăn</p>
            </div>
          </div>
          <div className="tab-content" style={{padding: '0 16px', marginTop: '16px', paddingBottom: '80px'}}>
            <div className="form-card mt-4" style={{marginBottom: '20px'}}>
              <h3 style={{marginBottom: '12px', fontSize: '1rem', color: '#000'}}>Cấu hình Giá Thu Cá</h3>
              <div className="form-group">
                <input
                  type="text" placeholder="Loại cá" className="input-field"
                  value={fishName} onChange={e => setFishName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="number" placeholder="Giá thu mua (VNĐ/kg)" className="input-field"
                  value={fishPrice} onChange={e => setFishPrice(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block" onClick={handleUpdateFishSettings}>Lưu cấu hình</button>
            </div>

            <div className="form-card mt-4" style={{marginBottom: '20px'}}>
              <h3 style={{marginBottom: '12px', fontSize: '1rem', color: '#000'}}>Thêm Sản Phẩm Mới</h3>
              <div className="form-group">
                <input
                  type="text" placeholder="Tên sản phẩm" className="input-field"
                  value={newProductName} onChange={e => setNewProductName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="number" placeholder="Giá bán (VNĐ)" className="input-field"
                  value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block" onClick={handleAddProduct}>Lưu Sản Phẩm</button>
            </div>

            <h3 style={{color: 'white', marginBottom: '12px'}}>Danh sách sản phẩm</h3>
            <div className="session-list">
              {appState.products.map(p => (
                <div key={p.id} className="session-card" style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h4 style={{margin: '0 0 4px', fontSize: '1rem', color: '#000'}}>{p.name}</h4>
                    <p style={{margin: '0', color: '#64748b', fontSize: '0.875rem'}}>{p.price.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <button className="btn-icon text-red" onClick={() => appState.removeProduct(p.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-content-area">
           <div className="header">
            <div>
              <h2>Khách Hàng</h2>
              <p className="subtitle">Quản lý khách quen</p>
            </div>
          </div>
          <div className="tab-content" style={{padding: '0 16px', marginTop: '16px'}}>
            <div className="session-list">
              {appState.customers.map(c => (
                <div key={c.id} className="session-card">
                  <div>
                    <h4 style={{margin: '0 0 4px', fontSize: '1rem', color: '#000'}}>{c.name || 'Khách Vãng Lai'}</h4>
                    <p style={{margin: '0', color: '#64748b', fontSize: '0.875rem'}}>{c.phone}</p>
                  </div>
                </div>
              ))}
              {appState.customers.length === 0 && (
                <div className="empty-state" style={{color: 'rgba(255,255,255,0.6)', textAlign: 'center'}}>Chưa có khách hàng nào được lưu.</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'reports' && (
        <div className="dashboard-content-area">
          <div className="header">
            <div>
              <h2>Báo Cáo Chi Tiết</h2>
              <p className="subtitle">Thống kê doanh thu & lợi nhuận</p>
            </div>
          </div>
          
          <div className="tab-content" style={{padding: '0 16px', marginTop: '16px', paddingBottom: '80px'}}>
            <div className="stat-card-large" style={{background: 'linear-gradient(135deg, #0f342b 0%, #1a4a3d 100%)', color: 'white'}}>
              <div className="label" style={{color: 'rgba(255,255,255,0.7)'}}>TỔNG DOANH THU (HÔM NAY)</div>
              <div className="value" style={{color: 'var(--gold-color)'}}>{todayRevenue.toLocaleString('vi-VN')}đ</div>
              <div className="subtext" style={{color: 'rgba(255,255,255,0.5)'}}>Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</div>
            </div>

            <div className="section mt-4">
              <h3 style={{color: 'white', marginBottom: '16px'}}><PieChart size={18} className="inline-icon"/> Phân bổ nguồn thu</h3>
              <div className="form-card" style={{padding: '20px'}}>
                <div className="report-row">
                  <div className="report-item">
                    <span className="dot gold"></span>
                    <span className="label">Tiền vé câu:</span>
                    <span className="val">{totalTickets.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="progress-bar"><div className="fill gold" style={{width: `${(totalTickets/todayRevenue)*100}%`}}></div></div>
                </div>
                
                <div className="report-row mt-3">
                  <div className="report-item">
                    <span className="dot green"></span>
                    <span className="label">Tiền dịch vụ:</span>
                    <span className="val">{totalFoodRevenue.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="progress-bar"><div className="fill green" style={{width: `${(totalFoodRevenue/todayRevenue)*100}%`}}></div></div>
                </div>

                <div className="report-row mt-3">
                  <div className="report-item">
                    <span className="dot red"></span>
                    <span className="label">Chi phí thu cá:</span>
                    <span className="val">-{fishCost.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="progress-bar"><div className="fill red" style={{width: '100%', opacity: 0.3}}></div></div>
                </div>
                
                <hr style={{margin: '20px 0', border: 'none', borderTop: '1px dashed #ddd'}} />
                
                <div className="report-item total">
                  <span className="label">Lợi nhuận ròng:</span>
                  <span className="val text-lg font-bold" style={{color: 'var(--success-color)'}}>{netProfit.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            <div className="section mt-4">
              <h3 style={{color: 'white', marginBottom: '16px'}}><BarChart3 size={18} className="inline-icon"/> Thống kê nhanh</h3>
              <div className="stats-grid">
                <div className="stat-card-small">
                  <div className="stat-label-small">Số ca câu</div>
                  <div className="stat-value-small" style={{color: '#333'}}>{completedSessions.length}</div>
                </div>
                <div className="stat-card-small">
                  <div className="stat-label-small">Lượng cá thu</div>
                  <div className="stat-value-small" style={{color: '#333'}}>{completedSessions.reduce((sum, s) => sum + (s.fishWeight || 0), 0).toFixed(1)}kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutGrid size={24} />
          <span className="nav-label">Chính</span>
        </button>
        <button className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
          <ClipboardList size={24} />
          <span className="nav-label">Ca Câu</span>
        </button>
        <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <BarChart3 size={24} />
          <span className="nav-label">Báo Cáo</span>
        </button>
        <button className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
          <ShoppingBag size={24} />
          <span className="nav-label">Dịch Vụ</span>
        </button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={24} />
          <span className="nav-label">Lịch Sử</span>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
