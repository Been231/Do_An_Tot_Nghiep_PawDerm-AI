import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode, Clock, CheckCircle2, AlertTriangle, Copy, Check, RefreshCw,
  Zap, X, ShieldCheck, Sparkles, ArrowRight, Building, Smartphone
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';

export default function PaymentQrModal({
  isOpen,
  appointment,
  onClose,
  onPaymentSuccess
}) {
  if (!isOpen || !appointment) return null;

  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [isExpired, setIsExpired] = useState(false);
  const [isPaid, setIsPaid] = useState(appointment.payment_status === 'paid');
  const [copiedField, setCopiedField] = useState(null);
  const [loadingRegenerate, setLoadingRegenerate] = useState(false);
  const [loadingSimulate, setLoadingSimulate] = useState(false);
  const [qrUrl, setQrUrl] = useState(appointment.payment_qr_url || '');

  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  const amount = appointment.payment_amount || 200000;
  const memo = appointment.payment_memo || `PAWDERM ${appointment.id}`;
  const bankInfo = appointment.bank_info || {
    bank_id: 'MB',
    account_no: '0795477302',
    account_name: 'BENH VIEN THU Y PAWDERM'
  };

  // 1. Tính toán thời gian còn lại ban đầu và khởi chạy bộ đếm ngược 10 phút
  useEffect(() => {
    setQrUrl(appointment.payment_qr_url || '');
    if (appointment.payment_status === 'paid') {
      setIsPaid(true);
      setIsExpired(false);
      return;
    }

    const calculateRemaining = () => {
      if (!appointment.payment_qr_expires_at) return 600;
      const expTime = new Date(appointment.payment_qr_expires_at).getTime();
      const nowTime = Date.now();
      const diff = Math.max(0, Math.floor((expTime - nowTime) / 1000));
      return diff;
    };

    const initialDiff = calculateRemaining();
    setRemainingSeconds(initialDiff);
    setIsExpired(initialDiff <= 0);

    if (initialDiff <= 0) {
      return;
    }

    // Đếm ngược mỗi 1 giây
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appointment]);

  // 2. Tự động thăm dò (polling) trạng thái thanh toán từ backend mỗi 2.5s
  useEffect(() => {
    if (isPaid || isExpired) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await appointmentService.getPaymentStatus(appointment.id);
        if (res?.payment_status === 'paid') {
          setIsPaid(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          if (onPaymentSuccess) {
            onPaymentSuccess(appointment.id);
          }
        } else if (res?.is_expired) {
          setIsExpired(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } catch (err) {
        console.warn('Polling payment status error:', err);
      }
    };

    // Kiểm tra ngay khi mở modal
    checkStatus();

    // Thăm dò định kỳ mỗi 2.5 giây
    pollingRef.current = setInterval(checkStatus, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [appointment.id, isPaid, isExpired]);

  // Xử lý tạo lại mã QR và gia hạn thêm 10 phút
  const handleRegenerateQr = async () => {
    setLoadingRegenerate(true);
    try {
      const res = await appointmentService.regeneratePaymentQr(appointment.id);
      if (res?.appointment) {
        setQrUrl(res.appointment.payment_qr_url);
        setIsExpired(false);
        setIsPaid(false);
        setRemainingSeconds(600);

        // Khởi động lại timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsExpired(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      alert('Lỗi tạo lại mã QR: ' + err.message);
    } finally {
      setLoadingRegenerate(false);
    }
  };

  // Kích hoạt mô phỏng thanh toán Demo Test (dành cho bảo vệ đồ án tốt nghiệp)
  const handleSimulatePayment = async () => {
    setLoadingSimulate(true);
    try {
      await appointmentService.simulatePayment(appointment.id);
      setIsPaid(true);
      setIsExpired(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (onPaymentSuccess) {
        onPaymentSuccess(appointment.id);
      }
    } catch (err) {
      alert('Lỗi demo test: ' + err.message);
    } finally {
      setLoadingSimulate(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format thời gian MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Tính phần trăm thời gian còn lại (10 phút = 600s)
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / 600) * 100));

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content animate-scaleUp"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        {/* NÚT ĐÓNG MODAL */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--bg-subtle)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            zIndex: 10
          }}
          title="Đóng cửa sổ"
        >
          <X size={18} />
        </button>

        {/* ===================== TRƯỜNG HỢP 1: THANH TOÁN THÀNH CÔNG ===================== */}
        {isPaid ? (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 12px 24px rgba(16, 185, 129, 0.35)',
                animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>

            <span
              style={{
                display: 'inline-block',
                background: '#ecfdf5',
                color: '#059669',
                padding: '4px 14px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: '700',
                marginBottom: '10px'
              }}
            >
              🎉 GIAO DỊCH THÀNH CÔNG
            </span>

            <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Đã Thanh Toán Khám Bệnh Thành Công!
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 20px' }}>
              Hệ thống đã tự động ghi nhận chuyển khoản cho bé <strong>"{appointment.pet_name}"</strong>. Ca khám đã được chuyển đến Bác sĩ chuyên khoa để tiếp nhận và khám sơ bộ.
            </p>

            {/* THẺ TỔNG KẾT GIAO DỊCH */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '13.5px',
                marginBottom: '24px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã lịch hẹn:</span>
                <strong style={{ color: 'var(--primary-teal-dark)' }}>#{appointment.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dịch vụ khám:</span>
                <strong>{appointment.service_title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khung giờ khám:</span>
                <strong>{appointment.appointment_time} · {appointment.appointment_date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tiền đã thanh toán:</span>
                <strong style={{ fontSize: '16px', color: '#059669' }}>{amount.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary-gradient"
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Hoàn Tất & Xem Chi Tiết Lịch Hẹn
            </button>
          </div>
        ) : (
          /* ===================== TRƯỜNG HỢP 2: ĐANG CHỜ THANH TOÁN HOẶC ĐÃ HẾT HẠN ===================== */
          <div style={{ padding: '26px 24px' }}>
            {/* TIÊU ĐỀ MODAL */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary-teal-dark)', marginBottom: '4px' }}>
                <QrCode size={22} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Thanh Toán VietQR Tự Động
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Quét mã QR bằng ứng dụng ngân hàng bất kỳ để xác nhận lịch khám ngay lập tức
              </p>
            </div>

            {/* THANH ĐẾM NGƯỢC THỜI GIAN THỰC (10 PHÚT) */}
            <div
              style={{
                background: isExpired ? '#fef2f2' : 'linear-gradient(135deg, rgba(42, 157, 143, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                border: `1px solid ${isExpired ? '#fecaca' : 'var(--primary-teal-border)'}`,
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: isExpired ? '#dc2626' : 'var(--primary-teal-dark)' }}>
                  <Clock size={16} />
                  <span>{isExpired ? 'Mã QR đã hết thời gian (quá 10 phút)' : 'Thời gian hiệu lực của mã QR:'}</span>
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: isExpired ? '#dc2626' : remainingSeconds <= 60 ? '#ea580c' : 'var(--primary-teal-dark)',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {isExpired ? '00:00 (Hết hạn)' : formatTime(remainingSeconds)}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: isExpired ? '#dc2626' : remainingSeconds <= 60 ? '#ea580c' : 'var(--primary-teal)',
                    transition: 'width 1s linear'
                  }}
                />
              </div>

              {!isExpired && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                  ⏳ Hệ thống đang tự động lắng nghe giao dịch chuyển khoản mỗi 2 giây...
                </div>
              )}
            </div>

            {/* KHUNG HIỂN THỊ MÃ QR */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1.5px dashed var(--border-subtle)',
                position: 'relative',
                marginBottom: '18px'
              }}
            >
              {isExpired ? (
                /* GIAO DIỆN KHI MÃ QR ĐÃ HẾT HẠN */
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#fee2e2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px'
                    }}
                  >
                    <AlertTriangle size={32} />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626', marginBottom: '6px' }}>
                    Phiên Thanh Toán Đã Quá Hạn 10 Phút
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                    Để đảm bảo an toàn giao dịch và giữ chỗ cho khung giờ khám, mã QR này đã hết hiệu lực. Bạn có thể bấm nút bên dưới để tạo ngay mã QR mới gia hạn thêm 10 phút.
                  </p>
                  <button
                    onClick={handleRegenerateQr}
                    disabled={loadingRegenerate}
                    className="btn-primary-gradient"
                    style={{
                      padding: '11px 22px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={16} className={loadingRegenerate ? 'spin' : ''} />
                    <span>{loadingRegenerate ? 'Đang tạo mã QR mới...' : '🔄 Tạo lại mã QR mới (Gia hạn 10 phút)'}</span>
                  </button>
                </div>
              ) : (
                /* HIỂN THỊ ẢNH VIETQR CHUẨN */
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '10px',
                      borderRadius: '14px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      display: 'inline-block',
                      marginBottom: '10px'
                    }}
                  >
                    <img
                      src={qrUrl}
                      alt="VietQR PawDerm"
                      style={{
                        width: '240px',
                        height: '240px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                          `2|99|${bankInfo.account_no}|${bankInfo.account_name}||0|0|${amount}|${memo}`
                        )}`;
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--primary-teal)' }} />
                    <span>Hỗ trợ chuyển nhanh 24/7 qua Napas247 từ mọi ngân hàng</span>
                  </div>
                </div>
              )}
            </div>

            {/* THÔNG TIN CHUYỂN KHOẢN CHI TIẾT CÓ NÚT COPY */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '14px 16px',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              {/* Ngân hàng */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngân hàng thụ hưởng:</span>
                <strong style={{ color: 'var(--text-main)' }}>{bankInfo.bank_id} (Ngân hàng Quân Đội MB)</strong>
              </div>

              {/* Tên chủ tài khoản */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chủ tài khoản:</span>
                <strong style={{ color: 'var(--text-main)' }}>{bankInfo.account_name}</strong>
              </div>

              {/* Số tài khoản */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tài khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '14.5px', color: 'var(--primary-teal-dark)' }}>{bankInfo.account_no}</strong>
                  <button
                    onClick={() => copyToClipboard(bankInfo.account_no, 'account_no')}
                    style={{
                      background: copiedField === 'account_no' ? 'var(--success-light)' : '#ffffff',
                      color: copiedField === 'account_no' ? 'var(--success)' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedField === 'account_no' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'account_no' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Số tiền */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tiền:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#059669' }}>{amount.toLocaleString('vi-VN')} VNĐ</strong>
                  <button
                    onClick={() => copyToClipboard(amount.toString(), 'amount')}
                    style={{
                      background: copiedField === 'amount' ? 'var(--success-light)' : '#ffffff',
                      color: copiedField === 'amount' ? 'var(--success)' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedField === 'amount' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Nội dung chuyển khoản */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nội dung chuyển khoản (bắt buộc):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--primary-orange-dark)', background: 'var(--primary-orange-light)', padding: '2px 8px', borderRadius: '6px' }}>
                    {memo}
                  </strong>
                  <button
                    onClick={() => copyToClipboard(memo, 'memo')}
                    style={{
                      background: copiedField === 'memo' ? 'var(--success-light)' : '#ffffff',
                      color: copiedField === 'memo' ? 'var(--success)' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedField === 'memo' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'memo' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* NÚT DEMO TEST DÀNH CHO THUYẾT MINH BẢO VỆ ĐỒ ÁN */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
                border: '1px dashed var(--primary-orange)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--primary-orange-dark)' }}>
                    <Zap size={15} />
                    <span>Tính năng Thuyết minh Đồ án:</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Mô phỏng ngân hàng gửi webhook xác nhận tiền về ngay lập tức
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={loadingSimulate || isPaid}
                  style={{
                    background: 'var(--primary-orange)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                  }}
                >
                  <Zap size={14} className={loadingSimulate ? 'spin' : ''} />
                  <span>{loadingSimulate ? 'Đang kích hoạt...' : '⚡ Kích hoạt thanh toán ngay (Demo Test)'}</span>
                </button>
              </div>
            </div>

            {/* NÚT ĐÓNG */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-filter-pill"
                style={{ flex: 1, padding: '11px', textAlign: 'center', fontSize: '13.5px' }}
              >
                Đóng & Thanh toán sau
              </button>

              {!isExpired && (
                <button
                  type="button"
                  onClick={handleRegenerateQr}
                  disabled={loadingRegenerate}
                  className="btn-filter-pill"
                  style={{ padding: '11px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Tạo lại mã nếu cần đổi nội dung"
                >
                  <RefreshCw size={14} className={loadingRegenerate ? 'spin' : ''} />
                  <span>Làm mới QR</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
