import React, { useState } from 'react';
import { 
  TrendingUp, Fish, LayoutGrid, ClipboardList, ShoppingBag, 
  Users, BarChart3, PlusCircle, Clock, ChevronRight, 
  Package, Receipt, ArrowRightLeft, Settings, LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard({ appState, onNavigate, initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [timeFilter, setTimeFilter] = useState('today');
  
  // Catalog state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const activeSessions = appState.sessions.filter(s => s.status === 'active');
  const completedSessions = appState.sessions.filter(s => s.status === 'completed');

  const todayRevenue = completedSessions.reduce((sum, s) => sum + (s.finalTotal || 0), 0);
  const avgSessionValue = completedSessions.length > 0 ? todayRevenue / completedSessions.length : 0;
  
  const handleAddProduct = async () => {
    if (!newProductName || !newProductPrice || isAddingProduct) return;
    setIsAddingProduct(true);
    const tId = toast.loading("Đang thêm sản phẩm...");
    try {
      await appState.addProduct({ name: newProductName, price: Number(newProductPrice), category: 'other' });
      setNewProductName('');
      setNewProductPrice('');
      toast.success(`Đã thêm ${newProductName}!`, { id: tId });
    } catch (err) {
      toast.error("Lỗi khi thêm sản phẩm!", { id: tId });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Tabs */}
            <div className="header-tabs">
              <button className={`tab-btn ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>Hôm nay</button>
              <button className={`tab-btn ${timeFilter === 'week' ? 'active' : ''}`} onClick={() => setTimeFilter('week')}>Tuần này</button>
              <button className={`tab-btn ${timeFilter === 'month' ? 'active' : ''}`} onClick={() => setTimeFilter('month')}>Tháng này</button>
            </div>

            <div className="content">
              {/* Stats Section */}
              <div className="stats-section">
                <div className="hero-card" onClick={() => setActiveTab('reports')}>
                  <div>
                    <div className="hero-label">Doanh thu hôm nay</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8, fontSize: '0.7rem' }}>
                      <Clock size={12} /> {new Date().toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="hero-value">{todayRevenue.toLocaleString('vi-VN')}đ</div>
                </div>
                
                <div className="small-stat-card">
                  <div className="small-label">Giá trị TB đơn</div>
                  <div className="small-value">{(avgSessionValue / 1000).toFixed(0)}k đ</div>
                </div>
                
                <div className="small-stat-card">
                  <div className="small-label">Số ca hoàn tất</div>
                  <div className="small-value">{completedSessions.length} ca</div>
                </div>
              </div>

              {/* Features Section */}
              <div className="features-section">
                <div className="section-title">Tính năng nổi bật</div>
                <div className="features-grid">
                  <div className="feature-card" onClick={() => onNavigate('create')}>
                    <div className="feature-icon-wrapper"><PlusCircle size={24} /></div>
                    <div className="feature-label">Bán hàng</div>
                  </div>
                  <div className="feature-card" onClick={() => setActiveTab('sessions')}>
                    <div className="feature-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={24} /></div>
                    <div className="feature-label">Đang câu</div>
                  </div>
                  <div className="feature-card" onClick={() => setActiveTab('catalog')}>
                    <div className="feature-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}><Package size={24} /></div>
                    <div className="feature-label">Sản phẩm</div>
                  </div>
                  <div className="feature-card" onClick={() => setActiveTab('reports')}>
                    <div className="feature-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}><BarChart3 size={24} /></div>
                    <div className="feature-label">Báo cáo</div>
                  </div>
                </div>
              </div>

              {/* List Section */}
              <div className="list-section">
                <div className="list-item" onClick={() => setActiveTab('sessions')}>
                  <div className="list-item-left">
                    <div style={{ color: 'var(--primary-color)' }}><Receipt size={20} /></div>
                    <span className="list-item-label">Ca câu đang chạy</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="list-item-badge">+{activeSessions.length}</span>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </div>
              </div>

              {/* History Section */}
              <div className="list-section" style={{ marginTop: '20px' }}>
                <div className="section-title" style={{ padding: '0 20px', fontSize: '0.9rem' }}>Lịch sử ca câu hôm nay</div>
                {completedSessions.length === 0 ? (
                  <div className="text-center p-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có ca câu nào hoàn tất.</div>
                ) : (
                  completedSessions.slice().reverse().map(session => (
                    <div key={session.id} className="list-item" style={{ borderBottom: '1px solid #f1f5f9', borderRadius: 0, margin: 0 }}>
                      <div className="list-item-left">
                        <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px', borderRadius: '8px' }}><ClipboardList size={16} /></div>
                        <div>
                          <div className="list-item-label">{session.customerName || 'Khách vãng lai'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Thu: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{session.finalTotal?.toLocaleString('vi-VN')}đ</span>
                            {' • '}
                            {new Date(session.endTime || Date.now()).toLocaleTimeString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );
      case 'sessions':
        return (
          <div className="content p-4">
            <h3 className="section-title">Ca Câu Đang Chạy</h3>
            {activeSessions.length === 0 ? (
              <div className="text-center mt-4" style={{ color: 'var(--text-muted)' }}>Không có ca nào đang chạy.</div>
            ) : (
              activeSessions.map(session => {
                const timeLeftMs = session.startTime + session.durationHours * 3600000 - Date.now();
                const isWarning = timeLeftMs > 0 && timeLeftMs <= 900000; // Under 15 mins
                const isExpired = timeLeftMs <= 0;
                
                return (
                  <div key={session.id} className="list-item" onClick={() => onNavigate('active', session.id)}>
                    <div className="list-item-left">
                      <Clock size={20} color={isExpired ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--primary-color)'} className={isWarning ? 'animate-pulse' : ''} />
                      <div>
                        <div className="list-item-label">{session.customerName || 'Khách vãng lai'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bắt đầu: {new Date(session.startTime).toLocaleTimeString('vi-VN')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isExpired && <span className="list-item-badge" style={{ background: '#fee2e2', color: '#ef4444' }}>Hết giờ</span>}
                      {isWarning && <span className="list-item-badge" style={{ background: '#fef3c7', color: '#d97706' }}>Sắp hết</span>}
                      <ChevronRight size={16} color="#cbd5e1" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      case 'reports':
        return (
          <div className="content p-4">
            <h3 className="section-title">Báo Cáo Doanh Thu</h3>
            <div className="hero-card" style={{ marginBottom: '20px' }}>
              <div className="hero-label">Tổng doanh thu hôm nay</div>
              <div className="hero-value">{todayRevenue.toLocaleString('vi-VN')}đ</div>
            </div>
            {/* Additional report details can be added here */}
          </div>
        );
      case 'catalog':
        return (
          <div className="content p-4">
            <h3 className="section-title">Danh Mục Sản Phẩm</h3>
            <div style={{ background: 'white', padding: '15px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <input type="text" placeholder="Tên sản phẩm" className="input-field" value={newProductName} onChange={e => setNewProductName(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
                <input type="number" placeholder="Giá bán" className="input-field" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
                <button className="btn btn-primary btn-block mt-4" onClick={handleAddProduct}>Thêm sản phẩm</button>
              </div>
            </div>
            {appState.products.map(p => (
              <div key={p.id} className="list-item">
                <div className="list-item-left">
                  <ShoppingBag size={20} color="var(--primary-color)" />
                  <span className="list-item-label">{p.name}</span>
                </div>
                <div className="font-bold">{p.price.toLocaleString('vi-VN')}đ</div>
              </div>
            ))}
          </div>
        );
      case 'customers':
        return (
          <div className="content p-4">
            <h3 className="section-title">Khách Hàng</h3>
            {appState.customers.map(c => (
              <div key={c.id} className="list-item">
                <div className="list-item-left">
                  <Users size={20} color="#0ea5e9" />
                  <div>
                    <div className="list-item-label">{c.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'admin':
        return (
          <div className="content p-4">
            <h3 className="section-title" style={{ color: '#ef4444' }}>Admin Panel - Quản Lý Users</h3>
            <div className="hero-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' }}>
              <div className="hero-label">Tổng số Users đăng ký</div>
              <div className="hero-value">{appState.allUsers?.length || 0}</div>
            </div>
            
            {appState.allUsers?.map(u => (
              <div key={u.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                  )}
                  <div>
                    <div className="list-item-label" style={{ color: u.isAdmin ? '#ef4444' : 'var(--text-main)' }}>
                      {u.name || 'Chưa cập nhật'} {u.isAdmin && '(Admin)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', width: '100%' }}>
                  Last Login: {u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Bar / Logo */}
      <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '6px', borderRadius: '8px' }}><Fish size={20} /></div>
          <span style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--primary-color)', letterSpacing: '-0.5px' }}>FISH<span style={{ color: 'var(--secondary-color)' }}>POND</span></span>
        </div>
        <button onClick={() => {
          toast.success("Đã đăng xuất!");
          appState.logout();
        }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><LogOut size={20} /></button>
      </div>

      {renderContent()}

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          {activeTab === 'dashboard' && <div className="nav-indicator"></div>}
          <LayoutGrid size={22} />
          <span>Tổng quan</span>
        </button>
        <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          {activeTab === 'reports' && <div className="nav-indicator"></div>}
          <BarChart3 size={22} />
          <span>Báo cáo</span>
        </button>
        <button className="nav-item" onClick={() => onNavigate('create')}>
          <PlusCircle size={22} />
          <span>Tạo ca</span>
        </button>
        <button className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
          {activeTab === 'catalog' && <div className="nav-indicator"></div>}
          <ShoppingBag size={22} />
          <span>Sản phẩm</span>
        </button>
        <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          {activeTab === 'customers' && <div className="nav-indicator"></div>}
          <Users size={22} />
          <span>Khách</span>
        </button>
        {appState.user?.isAdmin && (
          <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            {activeTab === 'admin' && <div className="nav-indicator"></div>}
            <Settings size={22} />
            <span>Admin</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
