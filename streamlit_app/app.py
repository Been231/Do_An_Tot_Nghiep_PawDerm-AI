"""
PawDerm AI - Hệ thống Trí tuệ Nhân tạo Hỗ trợ Chẩn đoán Bệnh Da liễu & Đề xuất Dịch vụ Y tế Thú cưng
Điểm khởi chạy chính thức của ứng dụng Web (Web Application Main Entrypoint)
"""

import sys
from pathlib import Path

# Đảm bảo streamlit_app, backend và thư mục gốc nằm trong sys.path
_cur_dir = Path(__file__).resolve().parent
_root_dir = _cur_dir.parent
_backend_dir = _root_dir / "backend"

for _p in [str(_cur_dir), str(_backend_dir), str(_root_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

import streamlit as st
import config
from auth.auth_manager import AuthManager
from services.history_service import HistoryService
from services.diagnosis_service import DiagnosisService
from components.header import HeaderComponent
from components.home_view import HomeViewComponent
from components.pet_form import PetFormComponent
from components.result_view import ResultViewComponent
from components.pet_profile_view import PetProfileViewComponent
from components.history_view import HistoryViewComponent


# Danh sách các trang chính trong hệ thống
PAGES = [
    "🏠 Trang chủ",
    "🔬 Chẩn đoán AI (Khám bệnh)",
    "🐾 Hồ sơ Thú cưng & Chủ nuôi",
    "📈 Lịch sử & Tiến triển Bệnh"
]


def navigate_to(page_name: str) -> None:
    """Hàm chuyển hướng trang tương tác mượt mà trong ứng dụng."""
    if page_name in PAGES:
        st.session_state.current_page = page_name
        st.rerun()


def main() -> None:
    """Hàm điều phối luồng thực thi chính của ứng dụng Web."""
    # 1. Cấu hình giao diện trang Streamlit chuẩn Web Application (wide layout)
    st.set_page_config(
        page_title=f"{config.APP_NAME} - Web Chẩn đoán Da liễu & Y tế Thú cưng",
        page_icon=config.APP_ICON,
        layout=config.PAGE_LAYOUT,
        initial_sidebar_state="expanded"
    )

    # 2. Tiêm hệ thống CSS Web tươi sáng, ấm áp, thân thiện đề tài chó mèo
    st.markdown(config.CUSTOM_WEB_CSS, unsafe_allow_html=True)

    # 3. Khởi tạo trạng thái Session State
    AuthManager.init_session_state()
    HistoryService.init_history_state()
    current_user = AuthManager.get_current_user()

    # Mặc định sau khi đăng nhập là Trang chủ (🏠 Trang chủ)
    if "current_page" not in st.session_state:
        st.session_state.current_page = "🏠 Trang chủ"

    # 4. Kiểm tra phân quyền: Nếu chưa đăng nhập -> Cổng đăng nhập/đăng ký
    if current_user is None:
        AuthManager.render_auth_view()
        return

    # 5. Thanh điều hướng Sidebar Web tươi sáng
    current_page = st.session_state.current_page
    current_index = PAGES.index(current_page) if current_page in PAGES else 0

    with st.sidebar:
        st.markdown(
            f"""
            <div style="padding: 10px 0 16px 0; border-bottom: 1.5px solid #e7ded0; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 28px;">{config.APP_ICON}</span>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #ea580c;">{config.APP_NAME}</h2>
                </div>
                <span style="font-size: 12px; color: #78716c; font-weight: 600; display: block; margin-top: 4px;">
                    Hệ Thống Y Tế Da Liễu Chó & Mèo 🐶🐱
                </span>
            </div>
            """,
            unsafe_allow_html=True
        )

        selected_page = st.radio(
            "ĐIỀU HƯỚNG HỆ THỐNG:",
            PAGES,
            index=current_index,
            key="sidebar_nav_radio"
        )

        if selected_page != st.session_state.current_page:
            st.session_state.current_page = selected_page
            st.rerun()

        st.markdown("---")

        # Thẻ thông tin người dùng ở góc sidebar với nền trắng trên nền be sữa
        st.markdown(
            f"""
            <div style="background: #ffffff; border-radius: 16px; padding: 14px 16px; border: 1.5px solid #eee7db; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(180, 160, 140, 0.08);">
                <div style="font-size: 11px; text-transform: uppercase; color: #a8a29e; font-weight: 700; letter-spacing: 0.3px;">Chủ nuôi đăng nhập</div>
                <div style="font-size: 14px; font-weight: 800; color: #1c1917; margin-top: 4px;">👤 {current_user.get('full_name')}</div>
                <div style="font-size: 12px; color: #78716c; margin-top: 2px;">📞 {current_user.get('phone')}</div>
            </div>
            """,
            unsafe_allow_html=True
        )

        if st.button("🚪 Đăng xuất tài khoản", key="sidebar_logout_btn", use_container_width=True):
            AuthManager.logout()

    # 6. Thanh tiện ích đầu trang
    HeaderComponent.render_top_bar(current_user)

    # 7. Phân luồng hiển thị giao diện theo trang hiện tại
    active_page = st.session_state.current_page

    # TRANG CHỦ (HOMEPAGE) - Hiển thị ngay sau khi đăng nhập
    if active_page == "🏠 Trang chủ":
        HomeViewComponent.render_home_page(current_user, navigate_to)

    # TRANG CHẨN ĐOÁN AI (KHÁM BỆNH) - Khi bấm "Bắt đầu khám"
    elif active_page == "🔬 Chẩn đoán AI (Khám bệnh)":
        _render_diagnosis_view()

    # TRANG HỒ SƠ THÚ CƯNG & CHỦ NUÔI
    elif active_page == "🐾 Hồ sơ Thú cưng & Chủ nuôi":
        PetProfileViewComponent.render_pet_management_page()

    # TRANG LỊCH SỬ & TIẾN TRIỂN BỆNH
    elif active_page == "📈 Lịch sử & Tiến triển Bệnh":
        HistoryViewComponent.render_history_page()


def _render_diagnosis_view() -> None:
    """Giao diện Phân hệ Chẩn đoán bệnh da liễu bằng AI."""
    st.markdown(
        """
        <div class="hero-banner" style="padding: 26px 32px !important; margin-bottom: 22px !important;">
            <span style="background: rgba(255, 255, 255, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                🔬 Chẩn Đoán Hình Ảnh AI
            </span>
            <h1 style="margin: 8px 0 4px 0; font-size: 26px; font-weight: 800; color: #ffffff !important;">
                Khám Da Liễu Chuyên Sâu Cho Chó & Mèo
            </h1>
            <p style="margin: 0; font-size: 14px; color: #f0fdfa !important;">
                Quét và phân tích đa lớp xác suất nấm da Ringworm, ghẻ Demodex và viêm da dị ứng qua ảnh chụp thực tế
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 1. Thu thập thông tin thú cưng cần khám
    pet_data = PetFormComponent.render_pet_selection_or_input()

    st.write("---")

    # 2. Hướng dẫn góc chụp & tiếp nhận ảnh
    uploaded_file = PetFormComponent.render_image_input()

    if uploaded_file is not None:
        file_id = getattr(uploaded_file, "file_id", uploaded_file.name if hasattr(uploaded_file, "name") else "camera_input")
        if st.session_state.get("current_file_id") != file_id:
            st.session_state.current_file_id = file_id
            st.session_state.last_analysis_result = None

        col_btn1, col_btn2 = st.columns([1, 1])
        with col_btn1:
            btn_start_analysis = st.button(
                "🔬 Bắt đầu Phân tích Da liễu bằng AI",
                type="primary",
                use_container_width=True
            )

        if btn_start_analysis:
            progress_bar = st.progress(0)
            result = DiagnosisService.run_ai_analysis(
                image_file=uploaded_file,
                pet_data=pet_data,
                progress_bar=progress_bar
            )
            st.session_state.last_analysis_result = result
            st.session_state.last_pet_data = pet_data

        # 3. Hiển thị kết quả chi tiết
        if st.session_state.get("last_analysis_result") is not None:
            ResultViewComponent.render_full_results(
                result=st.session_state.last_analysis_result,
                pet_data=st.session_state.get("last_pet_data", pet_data)
            )


if __name__ == "__main__":
    main()
