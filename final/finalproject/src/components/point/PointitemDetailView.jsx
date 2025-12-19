import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./PointItemDetailModal.css";

export default function PointItemDetailView({ itemNo, onClose }) {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (itemNo) loadItem();
    }, [itemNo]);

    const loadItem = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(`/point/main/store/detail/${itemNo}`);
            setItem(resp.data);
        } catch (e) {
            toast.error("상품 정보를 불러올 수 없습니다.");
            onClose(); // 에러 시 모달 닫기
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async () => {
        const confirm = await Swal.fire({
            title: '상품 구매',
            text: `[${item.pointItemName}]을(를) 구매하시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#238636',
            confirmButtonText: '구매하기',
            background: '#161b22', color: '#f0f6fc'
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.post(`/point/main/store/detail/${itemNo}/buy`);
            await Swal.fire({
                icon: 'success', title: '구매 완료!',
                text: '인벤토리에 지급되었습니다.',
                background: '#161b22', color: '#f0f6fc',
                timer: 1500, showConfirmButton: false
            });
            onClose(); // 구매 후 모달 닫기
            window.location.reload(); // 포인트 반영을 위해 새로고침 (또는 상위 state 업데이트)
        } catch (e) {
            Swal.fire("구매 실패", e.response?.data || "오류 발생", "error");
        }
    };

    if (!itemNo) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-glass-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>
                
                {loading ? (
                    <div className="modal-loading">로딩 중...</div>
                ) : (
                    <div className="modal-detail-body">
                        <div className="modal-img-section">
                            <img src={item.pointItemSrc} alt={item.pointItemName} />
                        </div>
                        <div className="modal-info-section">
                            <span className="modal-type-badge">{item.pointItemType}</span>
                            <h2 className="modal-title">{item.pointItemName}</h2>
                            <p className="modal-desc">{item.pointItemContent}</p>
                            <div className="modal-price-box">
                                <span className="label">판매 가격</span>
                                <span className="price">{item.pointItemPrice.toLocaleString()} P</span>
                            </div>
                            <button className="modal-buy-btn" onClick={handleBuy}>구매하기</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}