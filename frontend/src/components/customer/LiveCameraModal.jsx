import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles } from 'lucide-react';
import '../../styles/liveCamera.css';

/**
 * Modal chụp ảnh trực tiếp từ Camera / Webcam
 * Sử dụng navigator.mediaDevices.getUserMedia & HTML5 Canvas
 */
export default function LiveCameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (cam sau) hoặc 'user' (cam trước)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Kiểm tra thiết bị có nhiều camera không
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.enumerateDevices?.().then(devices => {
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    }).catch(() => {});
  }, [isOpen]);

  // Khởi động Camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode) => {
    stopCamera();
    setError('');
    setIsInitializing(true);
    setCapturedImage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Trình duyệt của bạn không hỗ trợ truy cập Camera trực tiếp. Vui lòng sử dụng tính năng tải tệp ảnh!');
      setIsInitializing(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.warn('Lỗi mở camera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Quyền truy cập Camera bị từ chối. Vui lòng bấm biểu tượng ổ khóa trên thanh địa chỉ trình duyệt để cấp quyền Camera!');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Không tìm thấy Camera hoặc Webcam trên thiết bị của bạn!');
      } else {
        setError(`Không thể kết nối Camera: ${err.message || 'Lỗi thiết bị'}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Chụp một khung hình từ Video stream lên Canvas
  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Nếu là cam trước (user), có thể lật gương để tự nhiên
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    // Chuyển DataURL thành File object
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedImage({ dataUrl, file });
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirmUse = () => {
    if (!capturedImage) return;
    const { file, dataUrl } = typeof capturedImage === 'object' && capturedImage.file 
      ? capturedImage 
      : { file: null, dataUrl: capturedImage };

    onCapture?.(file, dataUrl);
    stopCamera();
    onClose?.();
  };

  const handleCloseModal = () => {
    stopCamera();
    setCapturedImage(null);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="cam-modal-overlay" onClick={handleCloseModal} role="dialog" aria-modal="true">
      <div className="cam-modal-container" onClick={e => e.stopPropagation()}>
        {/* Nút đóng góc trên */}
        <button type="button" className="cam-close-btn" onClick={handleCloseModal} title="Đóng Camera">
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <div className="cam-modal-header">
          <div className="cam-header-pill">
            <span className="cam-pulse-dot"></span>
            <Camera size={18} />
            <span className="cam-title-text">Chụp Ảnh Da Liễu Trực Tiếp</span>
          </div>
          <p className="cam-subtitle">
            Căn chỉnh vùng da rụng lông hoặc ửng đỏ của bé vào tâm ngắm chữ thập để AI phân tích chính xác nhất
          </p>
        </div>

        {/* Khung hiển thị Video Live / Ảnh chụp */}
        <div className="cam-viewport-wrapper">
          {error ? (
            <div className="cam-error-box">
              <AlertCircle size={36} className="text-danger mb-2" />
              <p className="cam-error-text">{error}</p>
              <button type="button" className="cam-btn-retry" onClick={() => startCamera(facingMode)}>
                <RefreshCw size={15} /> Thử lại
              </button>
            </div>
          ) : capturedImage ? (
            <div className="cam-preview-container">
              <img 
                src={typeof capturedImage === 'object' ? capturedImage.dataUrl : capturedImage} 
                alt="Ảnh chụp từ camera" 
                className="cam-frozen-img" 
              />
              <div className="cam-freeze-badge">
                <Check size={14} /> Ảnh chụp thành công
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                className={`cam-video-feed ${facingMode === 'user' ? 'mirrored' : ''}`}
              />

              {/* Lưới ngắm HUD chuẩn y tế */}
              <div className="cam-hud-overlay">
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                <div className="hud-crosshair-center">
                  <div className="hud-cross-line horizontal"></div>
                  <div className="hud-cross-line vertical"></div>
                </div>

                <div className="hud-guideline-box">
                  <span>🎯 Đặt vùng tổn thương vào đây</span>
                </div>
              </div>

              {isInitializing && (
                <div className="cam-loading-spinner">
                  <RefreshCw size={32} className="spin-animation text-amber" />
                  <span>Đang kết nối Camera...</span>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Thanh điều khiển dưới cùng */}
        <div className="cam-controls-bar">
          {capturedImage ? (
            <div className="cam-actions-pair">
              <button type="button" className="cam-btn-secondary" onClick={handleRetake}>
                <RefreshCw size={16} /> Chụp lại
              </button>
              <button type="button" className="cam-btn-primary" onClick={handleConfirmUse}>
                <Sparkles size={16} /> Dùng ảnh này phân tích AI
              </button>
            </div>
          ) : (
            <div className="cam-actions-row">
              {hasMultipleCameras && (
                <button 
                  type="button" 
                  className="cam-btn-icon" 
                  onClick={handleSwitchCamera} 
                  title="Đổi camera trước/sau"
                >
                  <RefreshCw size={18} />
                </button>
              )}

              <button 
                type="button" 
                className="cam-snap-btn-main" 
                onClick={handleSnap}
                disabled={Boolean(error) || isInitializing}
                title="Bấm để chụp ảnh"
              >
                <div className="cam-snap-inner-ring">
                  <div className="cam-snap-white-dot"></div>
                </div>
              </button>

              {hasMultipleCameras && <div style={{ width: '42px' }}></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
