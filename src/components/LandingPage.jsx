import React, { useState, useEffect } from 'react';

const features = [
  { icon: '🎣', title: 'Tạo Ca Câu Nhanh', desc: 'Chỉ 30 giây để tạo một ca mới, tự động tính giờ và báo hết giờ.' },
  { icon: '💰', title: 'Tính Tiền Tự Động', desc: 'Tự tính phí hồ, đồ ăn, cân cá — không sợ nhầm hay bỏ sót.' },
  { icon: '📊', title: 'Báo Cáo Doanh Thu', desc: 'Xem ngay doanh thu hôm nay, số ca hoàn tất, giá trị trung bình mỗi đơn.' },
  { icon: '🛍️', title: 'Quản Lý Sản Phẩm', desc: 'Thêm đồ ăn, thức uống, mồi câu — hiện ngay khi bán hàng.' },
  { icon: '👥', title: 'Lưu Khách Hàng', desc: 'Tự động lưu tên, SĐT khách — lần sau tìm lại nhanh hơn.' },
  { icon: '🖨️', title: 'In Hoá Đơn', desc: 'In biên lai ngay trên điện thoại, chuyên nghiệp như cửa hàng lớn.' },
];

const steps = [
  { num: '01', title: 'Đăng nhập Google', desc: 'Chỉ cần tài khoản Google — không cần tạo mật khẩu mới.' },
  { num: '02', title: 'Tạo ca câu', desc: 'Nhập tên khách, chọn thời gian, chọn mồi. Xong!' },
  { num: '03', title: 'Theo dõi & bán thêm', desc: 'App đếm giờ tự động, thêm đồ ăn, báo hết giờ.' },
  { num: '04', title: 'Thanh toán & in hoá đơn', desc: 'Tính tiền 1 chạm, in biên lai, lưu doanh thu.' },
];

export default function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('lp-root');
    const handler = () => setScrolled(el.scrollTop > 40);
    el?.addEventListener('scroll', handler);
    return () => el?.removeEventListener('scroll', handler);
  }, []);

  return (
    <div id="lp-root" style={{ height: '100%', overflowY: 'auto', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Sticky Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #e2e8f0' : 'none',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>🎣</span>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#065f46' }}>
            FISH<span style={{ color: '#d4af37' }}>POND</span>
          </span>
        </div>
        <button onClick={onGetStarted} style={{
          background: '#065f46', color: 'white', border: 'none',
          borderRadius: 50, padding: '8px 18px', fontWeight: 700,
          fontSize: '0.8rem', cursor: 'pointer',
        }}>Dùng thử</button>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #065f46 60%, #047857 100%)',
        padding: '50px 24px 60px', textAlign: 'center', color: 'white',
        marginTop: -60, paddingTop: 80,
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(212,175,55,0.2)',
          border: '1px solid rgba(212,175,55,0.5)',
          borderRadius: 50, padding: '5px 16px', fontSize: '0.75rem',
          fontWeight: 700, color: '#d4af37', marginBottom: 20, letterSpacing: 1,
        }}>✦ MIỄN PHÍ 100% — KHÔNG CẦN CÀI ĐẶT</div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: -0.5 }}>
          Quản lý hồ câu<br />
          <span style={{ color: '#d4af37' }}>thông minh hơn</span><br />
          trên điện thoại
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.8, margin: '0 0 36px', lineHeight: 1.6 }}>
          Tạo ca câu, tính tiền tự động, báo cáo doanh thu — tất cả trong lòng bàn tay. Không cần sổ sách, không lo nhầm số.
        </p>

        <button onClick={onGetStarted} style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          color: 'white', border: 'none', borderRadius: 50,
          padding: '16px 36px', fontSize: '1.1rem', fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(212,175,55,0.4)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          transform: 'translateY(0)', transition: 'transform 0.2s',
        }}
          onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
          onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🚀 Dùng thử miễn phí ngay
        </button>

        <p style={{ fontSize: '0.78rem', opacity: 0.55, marginTop: 12 }}>
          Đăng nhập bằng Google · Không cần cài app · Dùng được ngay
        </p>

        {/* Mock Phone Screenshot */}
        <div style={{
          marginTop: 40, background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20, padding: '18px 16px', maxWidth: 300, margin: '40px auto 0',
        }}>
          {[
            { label: 'Doanh thu hôm nay', value: '2.450.000đ', color: '#34d399' },
            { label: 'Ca đang chạy', value: '3 ca', color: '#fbbf24' },
            { label: 'Ca hoàn tất', value: '12 ca', color: '#a78bfa' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.label}</span>
              <span style={{ fontWeight: 800, color: item.color, fontSize: '0.95rem' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: '#065f46', padding: '20px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center',
      }}>
        {[
          { num: '< 1 phút', label: 'Tạo ca câu' },
          { num: '100%', label: 'Miễn phí' },
          { num: '0đ', label: 'Phí cài đặt' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ color: '#d4af37', fontWeight: 900, fontSize: '1.1rem' }}>{s.num}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#065f46', fontWeight: 800, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Tính năng</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Mọi thứ bạn cần để<br />quản lý hồ câu</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: 'white', borderRadius: 16, padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6, color: '#0f172a' }}>{f.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 20px 40px', background: '#f0fdf4' }}>
        <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
          <div style={{ color: '#065f46', fontWeight: 800, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Bắt đầu</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Chỉ 4 bước đơn giản</h2>
        </div>
        {steps.map((s, i) => (
          <div key={s.num} style={{
            display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: i === 0 ? '#065f46' : 'white',
              color: i === 0 ? 'white' : '#065f46',
              border: '2px solid #065f46',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.85rem',
            }}>{s.num}</div>
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div style={{ padding: '40px 20px', background: 'white' }}>
        <div style={{
          background: 'linear-gradient(135deg, #065f46, #047857)',
          borderRadius: 20, padding: 24, color: 'white', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>💬</div>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic', opacity: 0.9 }}>
            "Trước đây dùng sổ tay, hay nhầm tiền lắm. Giờ dùng app này tính tự động, khách hàng cũng tin tưởng hơn!"
          </p>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', opacity: 0.7 }}>— Chủ hồ câu tại Bình Dương</div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        padding: '50px 24px 60px', textAlign: 'center',
        background: 'linear-gradient(160deg, #0f172a, #065f46)',
        color: 'white',
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 12px' }}>
          Sẵn sàng nâng cấp<br />hồ câu của bạn?
        </h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: '0 0 32px' }}>
          Hoàn toàn miễn phí. Dùng ngay hôm nay.
        </p>
        <button onClick={onGetStarted} style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          color: 'white', border: 'none', borderRadius: 50,
          padding: '16px 40px', fontSize: '1.1rem', fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(212,175,55,0.4)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          🎣 Bắt đầu miễn phí
        </button>
        <p style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: 16 }}>
          Đăng nhập bằng Google · Không cần cài ứng dụng
        </p>
      </div>

    </div>
  );
}
