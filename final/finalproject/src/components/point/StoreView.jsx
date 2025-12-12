import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
// ★ [Toast 1] toast 임포트
import { toast } from "react-toastify";

// 3단계 등급 시스템
function getScore(level) {
    if (level === "관리자") return 99;
    if (level === "우수회원") return 2;
    if (level === "일반회원") return 1;
    return 0; 
}

export default function StoreView({ loginLevel, loginNickname, refreshPoint }) {
    const [items, setItems] = useState([]);       
    const [myItems, setMyItems] = useState([]);   
    
    const [showAddModal, setShowAddModal] = useState(false); 
    const [editTarget, setEditTarget] = useState(null);      
    
    const myScore = getScore(loginLevel);

    // 찜 목록 상태
    const [wishList, setWishList] = useState([]); 

    const loadItems = useCallback(async () => {
        try {
            const resp = await axios.get("/point/store/");
            setItems(resp.data);
        } catch (e) { console.error(e); }
    }, []);

    const loadMyItems = useCallback(async () => {
        if (!loginLevel) return; 
        try {
            const resp = await axios.get("/point/store/inventory/my");
            setMyItems(resp.data);
        } catch (e) { console.error(e); }
    }, [loginLevel]);

    const loadWishList = useCallback(async () => {
        if (!loginLevel) return;
        try {
            const resp = await axios.get("/point/store/wish/check");
            setWishList(resp.data);
        } catch (e) { console.error(e); }
    }, [loginLevel]);

    useEffect(() => {
        loadItems();
        loadMyItems();
        loadWishList();
    }, [loadItems, loadMyItems, loadWishList]);

    // [구매]
    const handleBuy = async (item) => {
        if (!window.confirm(`[${item.pointItemName}] 을(를) 구매하시겠습니까?`)) return;
        
        try {
            await axios.post("/point/store/buy", { itemNo: item.pointItemNo });
            
            // ★ [Toast 2] 성공 알림
            toast.success("구매 성공! 🎒보관함을 확인하세요.");
            
            loadItems(); 
            loadMyItems(); 
            if (refreshPoint) refreshPoint();
        } catch (err) {
            // ★ [Toast 3] 실패 알림
            toast.error(err.response?.data?.message || "구매 실패 😥");
        }
    };

    // [선물]
    const handleGift = async (item) => {
        const targetId = window.prompt("선물을 받을 친구의 ID를 입력하세요.");
        if (!targetId) return;
        
        if (!window.confirm(`${targetId}님에게 선물하시겠습니까?`)) return;
        
        try {
            await axios.post("/point/store/gift", { itemNo: item.pointItemNo, targetId });
            
            // ★ [Toast 4] 선물 성공
            toast.success(`🎁 ${targetId}님에게 선물 발송 완료!`);
            
            loadItems(); 
            if (refreshPoint) refreshPoint(); 
        } catch (err) {
            toast.error(err.response?.data?.message || "선물 실패 😥");
        }
    };

    // [삭제]
    const handleDelete = async (item) => {
        if (!window.confirm(`[${item.pointItemName}] 삭제하시겠습니까?`)) return;
        
        try {
            await axios.post("/point/store/item/delete", { pointItemNo: item.pointItemNo });
            // ★ [Toast 5] 삭제 성공
            toast.info("상품이 삭제되었습니다. 🗑️");
            loadItems();
        } catch (e) { 
            toast.error("삭제 실패"); 
        }
    };
    
    // [찜 토글]
    const handleToggleWish = async (itemNo) => {
        if (!loginLevel) {
            // ★ [Toast 6] 경고 알림
            toast.warning("로그인 후 이용 가능합니다. 🔒");
            return;
        }
        try {
            await axios.post("/point/store/wish/toggle", { itemNo });
            // 찜은 빈번하게 일어나므로 Toast를 띄우지 않거나, 아주 짧게 띄우는 것이 UX상 좋습니다.
            // 여기서는 UI(하트 색상)가 즉시 바뀌므로 Toast 생략 (원하시면 toast.success("찜 설정!") 추가 가능)
            loadWishList(); 
        } catch (e) { 
            console.error("찜 토글 실패:", e);
            toast.error("찜하기에 실패했습니다."); 
        }
    };

    return (
        <>
            {/* 상단 헤더 */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-muted fw-bold">🛒 전체 상품 ({items.length})</h5>
                {/* 관리자 버튼 */}
                {loginLevel === "관리자" && (
                    <button className="btn btn-dark btn-sm shadow-sm" onClick={() => setShowAddModal(true)}>
                        + 상품 등록
                    </button>
                )}
            </div>

            {/* 상품 리스트 */}
            <div className="row">
                {items.length === 0 ? (
                    <div className="col-12 text-center p-5 border rounded bg-light">
                        <h3 className="text-muted mb-3">텅... 🍃</h3>
                        <p>등록된 상품이 없습니다.</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const reqScore = getScore(item.pointItemReqLevel);
                        const canAccess = (myScore >= reqScore); 
                        const ownedCount = myItems.filter(i => i.pointInventoryItemNo === item.pointItemNo).length;
                        
                        const isUnique = item.pointItemUniques === 1;
                        const isAlreadyOwned = isUnique && ownedCount > 0;
                        const isWished = wishList.includes(item.pointItemNo); 

                        return (
                            <div className="col-md-3 mb-4" key={item.pointItemNo}>
                                <div className={`card h-100 shadow-sm border-0 ${!canAccess && loginLevel !== "관리자" ? "bg-light opacity-75" : ""}`}>
                                    
                                    {/* 찜 버튼 */}
                                    <button 
                                        className="btn border-0 position-absolute top-0 end-0 m-2 fs-4"
                                        style={{ zIndex: 10, background: 'transparent' }}
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleToggleWish(item.pointItemNo);
                                        }}
                                    >
                                        <span style={{ filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.3))" }}>
                                            {isWished ? "❤️" : "🤍"}
                                        </span>
                                    </button>

                                    {/* 이미지 영역 */}
                                    <div className="bg-secondary d-flex justify-content-center align-items-center text-white position-relative overflow-hidden" style={{ height: '160px' }}>
                                        {item.pointItemSrc ? (
                                            <img src={item.pointItemSrc} alt={item.pointItemName} style={{ width: '90%', height: '90%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="fs-5">No Image</span>
                                        )}
                                        {item.pointItemStock <= 0 && (
                                            <div className="position-absolute w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
                                                <span className="badge bg-danger fs-5">SOLD OUT</span>
                                            </div>
                                        )}
                                        {isUnique && (
                                            <span className="position-absolute top-0 start-0 m-2 badge bg-danger border border-white shadow-sm">
                                                1인 1회 한정
                                            </span>
                                        )}
                                    </div>

                                    {/* 정보 영역 */}
                                    <div className="card-body text-center d-flex flex-column p-3">
                                        <h6 className="card-title text-truncate fw-bold mb-1">{item.pointItemName}</h6>
                                        <p className="small text-muted mb-2 text-truncate">{item.pointItemContent}</p>
                                        
                                        <div className="d-flex justify-content-center gap-2 mb-2" style={{fontSize: "0.8rem"}}>
                                            <span className="text-muted">
                                                재고: <strong className={item.pointItemStock < 5 ? "text-danger" : ""}>{item.pointItemStock}</strong>
                                            </span>
                                            {ownedCount > 0 && (
                                                <span className="badge bg-info text-dark">보유 {ownedCount}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <p className="text-primary fs-5 fw-bold mb-1">{item.pointItemPrice.toLocaleString()} P</p>
                                            <span className={`badge mb-3 ${reqScore > 1 ? "bg-warning text-dark" : "bg-success bg-opacity-75"}`}>
                                                {item.pointItemReqLevel} 이상
                                            </span>

                                            <div className="w-100 d-grid gap-2">
                                                
                                                {/* 구매/선물 버튼 */}
                                                {canAccess ? (
                                                    <div className="d-flex gap-1">
                                                        <button 
                                                            className={`btn btn-sm flex-fill fw-bold ${isAlreadyOwned ? "btn-secondary" : "btn-primary"}`} 
                                                            onClick={() => handleBuy(item)} 
                                                            disabled={item.pointItemStock <= 0 || isAlreadyOwned}
                                                        >
                                                            {isAlreadyOwned ? "✅ 완료" : "구매"}
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm flex-fill fw-bold" 
                                                            onClick={() => handleGift(item)} 
                                                            disabled={item.pointItemStock <= 0}
                                                        >
                                                            🎁 선물
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-secondary btn-sm" disabled>
                                                        🔒 등급 부족
                                                    </button>
                                                )}

                                                {/* 관리자 버튼 */}
                                                {loginLevel === "관리자" && (
                                                    <div className="btn-group mt-1">
                                                        <button className="btn btn-success btn-sm py-0" style={{fontSize:'0.8rem'}} onClick={() => setEditTarget(item)}>
                                                            수정
                                                        </button>
                                                        <button className="btn btn-danger btn-sm py-0" style={{fontSize:'0.8rem'}} onClick={() => handleDelete(item)}>
                                                            삭제
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showAddModal && <ProductAdd closeModal={() => setShowAddModal(false)} reload={loadItems} />}
            {editTarget && <ProductEdit target={editTarget} closeModal={() => setEditTarget(null)} reload={loadItems} />}
        </>
    );
}