"""
Cơ sở tri thức bệnh học da liễu thú y (Veterinary Dermatology Knowledge Base)
Cung cấp thông tin chuẩn y khoa: nguyên nhân, triệu chứng lâm sàng, phác đồ sơ cứu và dấu hiệu nguy cấp.
"""

from typing import Dict, Any, List

DISEASE_DATABASE: Dict[str, Dict[str, Any]] = {
    "ringworm": {
        "name_vi": "Nhiễm nấm da",
        "name_en": "Ringworm (Dermatophytosis)",
        "cause": "Do các chủng vi nấm sợi khoáng (chủ yếu là Microsporum canis, Trichophyton mentagrophytes) xâm nhập và ký sinh tại lớp tế bào sừng của da, móng và thân lông.",
        "clinical_symptoms": [
            "Vùng tổn thương rụng lông hình tròn hoặc bầu dục giống như đồng tiền xu (ring-like).",
            "Bề mặt da đóng vảy xám trắng như gàu hoặc ửng đỏ, viền ngoài hơi gồ cao.",
            "Ngứa ngáy từ nhẹ đến dữ dội khiến thú cưng gãi, cọ xát vào tường hoặc liếm liên tục.",
            "Lông xung quanh khô ráp, giòn và dễ gãy sát gốc chân lông."
        ],
        "default_probabilities": [
            {"label": "Bệnh nấm da", "percent": 86.5, "color": "#c86438"},
            {"label": "Bệnh ghẻ da", "percent": 10.2, "color": "#d4a373"},
            {"label": "Ve ghẻ", "percent": 2.5, "color": "#94a3b8"},
            {"label": "Khỏe mạnh", "percent": 0.8, "color": "#10b981"}
        ],
        "severity_level": "Trung bình",
        "severity_badge": "badge-warning",
        "is_zoonotic": True,
        "zoonotic_warning": "⚠️ Bệnh CÓ NGUY CƠ LÂY SANG NGƯỜI (đặc biệt trẻ em và người già). Cần cách ly bé tạm thời và mang găng tay khi chăm sóc!",
        "home_first_aid": [
            "Đeo loa chống liếm (vòng Elizabeth) ngay lập tức để ngăn lây lan bào tử nấm sang các vùng da lành khác.",
            "Vệ sinh nhẹ nhàng bằng nước muối sinh lý 0.9% hoặc dung dịch Povidine pha loãng tỷ lệ màu cánh gián.",
            "Người chăm sóc bắt buộc đeo găng tay y tế khi bôi thuốc hoặc tắm cho thú cưng.",
            "Giặt sạch đệm ngủ, khử trùng đồ chơi và chuồng nuôi bằng xịt khử trùng chuyên dụng."
        ],
        "emergency_signs": [
            "Tổn thương nấm lan rộng chiếm trên 30% diện tích bề mặt cơ thể.",
            "Vùng da chảy dịch mủ vàng tanh hôi, lở loét sâu do nhiễm trùng thứ cấp (bội nhiễm vi khuẩn).",
            "Thú cưng sốt cao trên 39.5°C, lờ đờ, bỏ ăn, suy kiệt sức lực."
        ],
        "clinic_recommendations": [
            {
                "title": "Soi Tươi Vi Nấm & Đèn Wood",
                "icon": "🔬",
                "desc": "Soi mẫu da dưới kính hiển vi và quét đèn Wood huỳnh quang để định danh chính xác bào tử nấm.",
                "action_label": "Đặt lịch khám",
                "btn_key": "svc_ringworm_exam"
            },
            {
                "title": "Gói Tắm Trị Liệu Kháng Nấm",
                "icon": "🛁",
                "desc": "Liệu trình tắm dầu sát khuẩn Ketoconazole 2% kết hợp thảo dược làm mềm vảy sừng và diệt bào tử nấm.",
                "action_label": "Đăng ký tắm trị liệu",
                "btn_key": "svc_ringworm_bath"
            },
            {
                "title": "Kê Đơn Thuốc Đặc Trị",
                "icon": "💊",
                "desc": "Thuốc xịt ngoài da Fungikur kết hợp kem dưỡng phục hồi biểu mô theo cân nặng của bé.",
                "action_label": "Xem đơn thuốc",
                "btn_key": "svc_ringworm_meds",
                "prescription_info": "Đơn thuốc đề xuất: Dung dịch xịt nấm Fungikur (2 lần/ngày) + Dầu tắm Ketoconazole (2 lần/tuần) + Vitamin B Complex tăng sinh biểu bì."
            }
        ]
    },
    "demodicosis": {
        "name_vi": "Bệnh ghẻ Demodex",
        "name_en": "Demodectic Mange (Demodicosis)",
        "cause": "Do ve bao lông Demodex canis sinh sôi bùng phát với mật độ dày đặc trong nang lông và tuyến bã nhờn, thường khởi phát khi hệ thống miễn dịch của thú cưng bị suy yếu.",
        "clinical_symptoms": [
            "Rụng lông khởi phát quanh vùng mắt (tạo thành quầng kính râm), quanh mõm và kẽ móng chân.",
            "Vùng da tổn thương chuyển màu sẫm xám (sạm da), dày sần sùi và thô ráp.",
            "Xuất hiện các nốt mụn mủ nhỏ li ti, da tiết dịch nhờn rít có mùi hôi tanh đặc trưng.",
            "Ngứa ngáy dữ dội dẫn đến gãi làm rách da và chảy máu rỉ rả."
        ],
        "default_probabilities": [
            {"label": "Bệnh ghẻ da", "percent": 82.0, "color": "#c86438"},
            {"label": "Bệnh nấm da", "percent": 11.5, "color": "#d4a373"},
            {"label": "Ve ghẻ", "percent": 5.0, "color": "#94a3b8"},
            {"label": "Khỏe mạnh", "percent": 1.5, "color": "#10b981"}
        ],
        "severity_level": "Nguy hiểm - Cần can thiệp y tế",
        "severity_badge": "badge-danger",
        "is_zoonotic": False,
        "zoonotic_warning": "Bệnh thường không lây sang người do ký sinh trùng đặc hiệu theo loài, nhưng có thể lây từ mẹ sang con qua bú sữa.",
        "home_first_aid": [
            "Bổ sung chế độ ăn giàu dinh dưỡng, vitamin E, kẽm và dầu cá Omega-3 để phục hồi hệ miễn dịch.",
            "Giữ vệ sinh khô thoáng chỗ ở, tuyệt đối không tự ý dùng thuốc bôi chứa Corticoid làm trầm trọng thêm ghẻ.",
            "Cắt ngắn móng chân và đeo loa bảo vệ tránh cào rách da vùng mặt."
        ],
        "emergency_signs": [
            "Ghẻ toàn thân lan kín cơ thể, sốt cao do viêm mô tế bào dưới da.",
            "Da sưng phù nề, chảy máu hoặc mủ vàng liên tục, các hạch bạch huyết sưng to bất thường."
        ],
        "clinic_recommendations": [
            {
                "title": "Cạo Da Sâu Tìm Ký Sinh Trùng",
                "icon": "🔬",
                "desc": "Cạo sâu đến mao mạch để đếm mật độ con ghẻ Demodex sống dưới kính hiển vi chuyên dụng.",
                "action_label": "Đặt lịch cạo da",
                "btn_key": "svc_demo_scraping"
            },
            {
                "title": "Phác Đồ Nhóm Isoxazoline",
                "icon": "💊",
                "desc": "Uống hoặc nhỏ gáy thế hệ mới (Bravecto, Simparica, Nexgard) tiêu diệt sạch Demodex an toàn.",
                "action_label": "Tư vấn phác đồ",
                "btn_key": "svc_demo_meds",
                "prescription_info": "Phác đồ đề xuất: Viên nhai Isoxazoline 1 liều duy nhất + Kháng sinh Clavamox chống bội nhiễm mô sâu (theo chỉ định bác sĩ)."
            }
        ]
    },
    "dermatitis": {
        "name_vi": "Viêm da mủ & Dị ứng",
        "name_en": "Pyoderma & Allergic Dermatitis",
        "cause": "Phản ứng viêm quá mẫn dị ứng với thức ăn, bọ chét, phấn hoa môi trường kết hợp nhiễm trùng tụ cầu khuẩn (Staphylococcus pseudintermedius).",
        "clinical_symptoms": [
            "Các mảng da bụng, bẹn, nách ửng đỏ rực và nóng rát.",
            "Xuất hiện nhiều mụn mủ trắng hoặc mụn nước nhỏ vỡ ra tạo thành vảy cứng đóng cục.",
            "Thú cưng liên tục liếm láp bàn chân và cắn vào vùng đuôi/bụng."
        ],
        "default_probabilities": [
            {"label": "Ve ghẻ", "percent": 78.5, "color": "#c86438"},
            {"label": "Bệnh ghẻ da", "percent": 13.0, "color": "#d4a373"},
            {"label": "Bệnh nấm da", "percent": 6.5, "color": "#94a3b8"},
            {"label": "Khỏe mạnh", "percent": 2.0, "color": "#10b981"}
        ],
        "severity_level": "Trung bình",
        "severity_badge": "badge-warning",
        "is_zoonotic": False,
        "zoonotic_warning": "Không lây sang người. Là phản ứng dị ứng và bội nhiễm cơ địa của thú cưng.",
        "home_first_aid": [
            "Cách ly khỏi thảm len, bãi cỏ nghi ngờ có thuốc trừ sâu hoặc thức ăn lạ vừa đổi.",
            "Chườm mát bằng gạc y tế thấm nước muối sinh lý để xoa dịu cơn ngứa rát cục bộ.",
            "Tắm bằng dầu gội dược liệu dịu nhẹ có độ pH 6.5 - 7.5 cân bằng cho da chó mèo."
        ],
        "emergency_signs": [
            "Mụn mủ vỡ lan rộng khắp bụng và ngực tạo thành mảng viêm loét rỉ dịch vàng.",
            "Thú cưng bồn chồn rên rỉ, không thể ngủ do ngứa rát và đau đớn."
        ],
        "clinic_recommendations": [
            {
                "title": "Khám Dị Ứng Chuyên Sâu",
                "icon": "🩺",
                "desc": "Xét nghiệm tế bào học dịch tiết (Cytology) để xác định chuẩn lượng vi khuẩn tụ cầu và bạch cầu hạt.",
                "action_label": "Đặt lịch khám",
                "btn_key": "svc_derm_exam"
            },
            {
                "title": "Liệu Trình Kháng Viêm Sinh Học",
                "icon": "💉",
                "desc": "Tiêm kháng thể đơn dòng (Cytopoint) hoặc uống thuốc điều hòa dị ứng (Apoquel) dứt cơn ngứa trong 24h.",
                "action_label": "Xem tư vấn",
                "btn_key": "svc_derm_care",
                "prescription_info": "Phác đồ đề xuất: Thuốc xịt Cortavance giảm viêm tại chỗ + Dầu tắm Douxo S3 Pyo kháng khuẩn 2 lần/tuần."
            }
        ]
    },
    "healthy": {
        "name_vi": "Da lông khỏe mạnh",
        "name_en": "Healthy Skin & Coat",
        "cause": "Không phát hiện bất kỳ dấu hiệu tổn thương, ký sinh trùng hoặc vi nấm gây hại trên bề mặt da và nang lông.",
        "clinical_symptoms": [
            "Bề mặt da mềm mại, hồng hào tự nhiên, không có vảy gàu hay mụn mủ.",
            "Lông mọc đều đặn, bóng mượt, không có đốm rụng lông bất thường.",
            "Thú cưng không có biểu hiện ngứa ngáy, gãi liên tục hay cọ xát bất thường.",
            "Không có vết cắn của ve, bọ chét hoặc rận ký sinh ngoài da."
        ],
        "default_probabilities": [
            {"label": "Khỏe mạnh", "percent": 96.5, "color": "#10b981"},
            {"label": "Bệnh nấm da", "percent": 1.5, "color": "#c86438"},
            {"label": "Bệnh ghẻ da", "percent": 1.2, "color": "#d4a373"},
            {"label": "Ve ghẻ", "percent": 0.8, "color": "#94a3b8"}
        ],
        "severity_level": "Bình thường",
        "severity_badge": "badge-success",
        "is_zoonotic": False,
        "zoonotic_warning": "An toàn tuyệt đối. Thú cưng hoàn toàn khỏe mạnh, không có nguy cơ lây nhiễm sang người.",
        "home_first_aid": [
            "Duy trì chế độ dinh dưỡng giàu Omega-3, Omega-6 và Kẽm để lông luôn bóng mượt.",
            "Chải lông định kỳ 2-3 lần/tuần để loại bỏ lông chết và kích thích lưu thông máu dưới da.",
            "Tắm cho bé bằng sữa tắm chuyên dụng dành cho thú cưng 1-2 tuần/lần, sấy khô lông thật kỹ sau khi tắm.",
            "Nhỏ gáy phòng ngừa ve rận, bọ chét định kỳ mỗi tháng một lần."
        ],
        "emergency_signs": [
            "Hiện tại không có dấu hiệu nguy cấp.",
            "Nếu sau này phát hiện bé bắt đầu gãi nhiều hoặc rụng lông từng mảng, hãy chụp ảnh chẩn đoán lại ngay."
        ],
        "clinic_recommendations": [
            {
                "title": "Gói Spa & Grooming Định Kỳ",
                "icon": "✨",
                "desc": "Cắt tỉa lông tạo kiểu, vệ sinh tai, cắt móng và dưỡng lông chuyên sâu giúp bé luôn sạch đẹp.",
                "action_label": "Đặt lịch Spa",
                "btn_key": "svc_spa_grooming"
            },
            {
                "title": "Nhỏ Gáy Phòng Ký Sinh Trùng",
                "icon": "🛡️",
                "desc": "Thuốc nhỏ gáy định kỳ (Revolution / Bravecto / NexGard) ngăn ngừa ve rận và bọ chét.",
                "action_label": "Mua thuốc phòng",
                "btn_key": "svc_flea_prevent",
                "prescription_info": "Gợi ý phòng bệnh: Nhỏ gáy Revolution Plus (1 tuýp/tháng) bảo vệ toàn diện khỏi ve, rận, bọ chét và giun tim."
            }
        ]
    },
    "unrecognized_image": {
        "name_vi": "Ảnh không hợp lệ / Không nhận diện được thú cưng",
        "name_en": "Unrecognized Non-Pet Image",
        "cause": "Hình ảnh tải lên không thuộc vùng da hay cơ thể của chó/mèo. Hệ thống phát hiện đối tượng hoa quả, đồ vật hoặc hình ảnh ngoài phạm vi da liễu thú cưng.",
        "clinical_symptoms": [
            "Hình ảnh chụp hoa quả, thực vật, đồ ăn hoặc đồ dùng gia đình.",
            "Ảnh người, ảnh selfie hoặc ảnh chụp không có thú cưng.",
            "Ảnh bị nhòe mờ, chói sáng hoặc góc chụp quá xa không thấy rõ bề mặt da lông."
        ],
        "default_probabilities": [
            {"label": "Chưa nhận diện được", "percent": 100.0, "color": "#f59e0b"},
            {"label": "Bệnh nấm da", "percent": 0.0, "color": "#c86438"},
            {"label": "Bệnh ghẻ da", "percent": 0.0, "color": "#d4a373"},
            {"label": "Ve ghẻ", "percent": 0.0, "color": "#94a3b8"}
        ],
        "severity_level": "Chưa xác định",
        "severity_badge": "badge-secondary",
        "is_zoonotic": False,
        "zoonotic_warning": "Không áp dụng",
        "home_first_aid": [
            "Đưa camera lại gần vùng da bị tổn thương của bé cún/mèo (khoảng cách 15 - 20cm).",
            "Vén nhẹ lớp lông xung quanh để lộ rõ bề mặt da bị ửng đỏ, rụng lông hoặc đóng vảy.",
            "Chọn nơi đủ ánh sáng tự nhiên hoặc bật đèn flash để ảnh có độ nét và màu sắc chân thực nhất.",
            "Tham khảo khung hướng dẫn chụp ảnh chuẩn y tế bằng cách nhấn nút bên dưới."
        ],
        "emergency_signs": [
            "Vui lòng chụp lại ảnh đúng vùng da bệnh của thú cưng để nhận được kết quả chẩn đoán chính xác."
        ],
        "clinic_recommendations": []
    }
}


def get_disease_info(disease_key: str = "healthy") -> Dict[str, Any]:
    """Lấy dữ liệu bệnh lý từ cơ sở tri thức."""
    key = disease_key.lower().strip()
    return DISEASE_DATABASE.get(key, DISEASE_DATABASE.get("healthy", DISEASE_DATABASE["ringworm"]))
