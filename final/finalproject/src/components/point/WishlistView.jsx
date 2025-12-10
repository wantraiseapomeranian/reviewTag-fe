import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAtomValue } from "jotai"; 
import { loginIdState } from "../../utils/jotai"; 

export default function WishlistView() {
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
            console.log("찜 목록 데이터:", response.data); // 확인용 로그
            setWishes(response.data); 
        } catch (error) {
            console.error("로드 실패:", error);
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
        if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return;
        
        try {
            // 삭제 요청 (itemNo가 제대로 넘어가는지 확인)
            await axios.post("/point/store/wish/delete", { itemNo: itemNo });
            alert("삭제되었습니다.");
            loadWishes(); // 목록 갱신
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="text-center p-5">불러오는 중...</div>;
    if (!loginId) return <div className="alert alert-warning text-center mt-4">로그인이 필요합니다.</div>;
    if (wishes.length === 0) return <div className="alert alert-info text-center mt-4">💖 찜한 상품이 없습니다.</div>;

    return (
        <div className="mt-3">
            <h4 className="mb-4 fw-bold text-muted">찜 목록 ({wishes.length})</h4>
            <div className="row">
                {wishes.map((w) => (
                  
                    <div className="col-md-3 mb-4" key={w.withListNo}> 
                        <div className="card h-100 shadow-sm border-0 position-relative">
                            
                         
                            <button 
                                className="btn border-0 position-absolute top-0 end-0 m-2 text-danger"
                                onClick={() => handleRemove(w.withListItemNo)} 
                                title="삭제"
                            >
                                <i className="bi bi-trash"></i> ❌
                            </button> 
                            
                            {/* 이미지 및 정보 */}
                            <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: '160px', overflow: 'hidden' }}>
                                {w.pointItemSrc ? (
                                    <img src={w.pointItemSrc} alt={w.pointItemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span className="text-muted small">No Image</span>
                                )}
                            </div>

                            <div className="card-body text-center p-3">
                                <h6 className="fw-bold text-truncate mb-1">{w.pointItemName}</h6>
                                <p className="text-primary fw-bold mb-0">{w.pointItemPrice.toLocaleString()} P</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}