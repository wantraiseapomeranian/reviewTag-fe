import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAtomValue } from "jotai"; 
import { loginIdState } from "../../utils/jotai"; 
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./WishlistView.css";
// 1. 상세 모달 컴포넌트 임포트 (경로는 프로젝트 구조에 맞게 수정하세요)
import PointItemDetailView from "./PointitemDetailView"; 

export default function WishlistView({ refreshPoint }) { 
    const loginId = useAtomValue(loginIdState); 
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. 모달 제어를 위한 상태 추가 (선택된 상품 번호)
    const [selectedItemNo, setSelectedItemNo] = useState(null);

    const loadWishes = useCallback(async () => {
        if (!loginId) {
            setWishes([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get("/point/main/store/wish/my");
            setWishes(response.data); 
        } catch (error) {
            console.error("로드 실패:", error);
            toast.error("찜 목록을 불러오지 못했습니다. 😥");
            setWishes([]);
        } finally {
            setLoading(false);
        }
    }, [loginId]);

    useEffect(() => {
        loadWishes();
    }, [loadWishes]);

    const handleRemove = async (e, targetItemNo, itemName) => {
        e.stopPropagation(); // 3. 카드 클릭 이벤트(모달 열기)가 발생하지 않도록 차단
        
        const result = await Swal.fire({
            title: '위시리스트 삭제',
            text: `[${itemName}] 상품을 찜 목록에서 제거하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '삭제',
            background: '#1a1a1a',
            color: '#fff'
        });
        
        if (result.isConfirmed) {
            try {
                // 백엔드 엔드포인트에 맞춰 수정 (아까 400에러 났다면 필드명 확인 필수)
                await axios.post("/point/main/store/wish/toggle", { itemNo: targetItemNo });
                toast.info("찜 목록에서 삭제되었습니다. 🗑️");
                loadWishes();
            } catch (error) {
                toast.error("삭제에 실패했습니다.");
            }
        }
    };

    if (loading) return (
        <div className="text-center p-5">
            <div className="spinner-border text-primary"></div>
            <p className="text-white mt-2">목록을 불러오는 중...</p>
        </div>
    );
    
    if (!loginId) return <div className="alert-glass text-center mt-4 m-3">🔒 로그인이 필요한 서비스입니다.</div>;
    
    if (wishes.length === 0) return (
        <div className="wish-empty-glass">
            <span className="wish-empty-icon">💔</span>
            <h5 className="text-white fw-bold mb-2">찜한 상품이 없습니다.</h5>
            <p className="text-secondary small">스토어에서 마음에 드는 상품에 ❤️를 눌러보세요!</p>
        </div>
    );

    return (
        <div className="wishlist-wrapper mt-3">
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <h5 className="fw-bold text-white mb-0">
                    💖 MY WISHLIST <span className="wish-count-badge">{wishes.length}</span>
                </h5>
            </div>
            
            <div className="wish-grid">
                {wishes.map((w) => (
                    <div 
                        className="wish-glass-card" 
                        key={w.pointWishlistNo}
                        // 4. 카드 클릭 시 상세 모달 열기
                        onClick={() => setSelectedItemNo(w.pointWishlistItemNo)} 
                        style={{ cursor: 'pointer' }}
                    > 
                        <div className="wish-img-wrapper">
                            {w.pointItemSrc ? (
                                <img src={w.pointItemSrc} alt={w.pointItemName} className="wish-img" />
                            ) : (
                                <div className="no-img-box">No Image</div>
                            )}

                            <button 
                                className="btn-remove-wish-glass"
                                onClick={(e) => handleRemove(e, w.pointWishlistItemNo, w.pointItemName)}
                                title="목록에서 제거"
                            >
                                ✕
                            </button> 
                        </div>

                        <div className="wish-info">
                            <h6 className="wish-title-text" title={w.pointItemName}>{w.pointItemName}</h6>
                            <div className="wish-price-tag">{w.pointItemPrice.toLocaleString()} P</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. 상세 모달 렌더링 (selectedItemNo가 있을 때만 띄움) */}
            {selectedItemNo && (
                <PointItemDetailView
                    itemNo={selectedItemNo} 
                    onClose={() => setSelectedItemNo(null)} // 닫기 시 null로 변경
                />
            )}
        </div>
    );
}