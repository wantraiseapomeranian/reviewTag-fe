import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAtomValue } from "jotai"; 
import { loginIdState } from "../../utils/jotai"; 
// ★ [Toast 1] toast 임포트
import { toast } from "react-toastify";

export default function WishlistView({ refreshPoint }) { // refreshPoint를 혹시 쓸 경우를 대비해 props 유지
    const loginId = useAtomValue(loginIdState); 
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);

    // 찜 목록 불러오기
    const loadWishes = useCallback(async () => {
        if (!loginId) {
            setWishes([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get("/point/store/wish/my");
            setWishes(response.data); 
        } catch (error) {
            console.error("로드 실패:", error);
            // ★ [Toast 2] 로드 실패 알림
            toast.error("찜 목록을 불러오지 못했습니다. 😥");
            setWishes([]);
        } finally {
            setLoading(false);
        }
    }, [loginId]);

    useEffect(() => {
        loadWishes();
    }, [loadWishes]);

    // 찜 삭제 핸들러
    const handleRemove = async (itemNo) => {
        // 안전을 위해 confirm은 유지 (실수로 삭제 방지)
        if (!window.confirm("이 상품을 찜 목록에서 삭제하시겠습니까?")) return;
        
        try {
            // 삭제 요청
            await axios.post("/point/store/wish/delete", { itemNo: itemNo });
            
            // ★ [Toast 3] 삭제 성공 알림
            toast.info("찜 목록에서 삭제되었습니다. 🗑️");
            
            loadWishes(); // 목록 갱신
        } catch (error) {
            console.error("삭제 실패:", error);
            // ★ [Toast 4] 삭제 실패 알림
            toast.error("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (!loginId) return <div className="alert alert-warning text-center mt-4 m-3">🔒 로그인이 필요합니다.</div>;
    
    // 찜 목록이 없을 때 디자인 개선
    if (wishes.length === 0) return (
        <div className="text-center mt-5 p-5 bg-light rounded m-3">
            <h1 className="display-4 mb-3">💖</h1>
            <h5 className="text-secondary">찜한 상품이 없습니다.</h5>
            <p className="text-muted small">마음에 드는 상품을 담아보세요!</p>
        </div>
    );

    return (
        <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <h5 className="fw-bold text-secondary mb-0">💖 나의 찜 목록 ({wishes.length})</h5>
            </div>
            
            <div className="row">
                {wishes.map((w) => (
                    // DTO 필드명(withListNo) 오타가 있다면 백엔드에 맞게 수정 필요
                    <div className="col-md-3 mb-4" key={w.withListNo || w.pointItemNo}> 
                        <div className="card h-100 shadow-sm border-0 position-relative hover-card">
                            
                            {/* 삭제 버튼 */}
                            <button 
                                className="btn border-0 position-absolute top-0 end-0 m-2 text-secondary fs-5"
                                style={{zIndex: 10, background: 'rgba(255,255,255,0.7)', borderRadius: '50%'}}
                                onClick={() => handleRemove(w.withListItemNo)} 
                                title="목록에서 제거"
                            >
                                ❌
                            </button> 
                            
                            {/* 이미지 영역 */}
                            <div className="bg-secondary d-flex justify-content-center align-items-center overflow-hidden position-relative" style={{ height: '160px' }}>
                                {w.pointItemSrc ? (
                                    <img src={w.pointItemSrc} alt={w.pointItemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span className="text-white small">No Image</span>
                                )}
                            </div>

                            {/* 정보 영역 */}
                            <div className="card-body text-center p-3">
                                <h6 className="fw-bold text-truncate mb-2">{w.pointItemName}</h6>
                                <p className="text-primary fw-bold fs-5 mb-0">{w.pointItemPrice.toLocaleString()} P</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}