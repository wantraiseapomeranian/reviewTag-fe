import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
import { toast } from "react-toastify";
import "./StoreView.css";

// 3단계 등급 점수 변환
function getScore(level) {
    if (level === "관리자") return 99;
    if (level === "우수회원") return 2;
    if (level === "일반회원") return 1;
    return 0; 
}

export default function StoreView({ loginLevel, refreshPoint }) {
    const [items, setItems] = useState([]);       
    const [myItems, setMyItems] = useState([]);   
    
    // 모달 상태
    const [showAddModal, setShowAddModal] = useState(false); 
    const [editTarget, setEditTarget] = useState(null);      
    
    const myScore = getScore(loginLevel);
    const [wishList, setWishList] = useState([]); 

    // 1. 상품 목록 불러오기
    const loadItems = useCallback(async () => {
        try {
            const resp = await axios.get("/point/main/store"); 
            setItems(resp.data);
        } catch (e) { console.error(e); }
    }, []);

    // 2. 내 보유 아이템 불러오기
    const loadMyItems = useCallback(async () => {
        if (!loginLevel) return; 
        try {
            const resp = await axios.get("/point/main/store/inventory/my");
            setMyItems(resp.data);
        } catch (e) { console.error(e); }
    }, [loginLevel]);

    // 3. 찜 목록 불러오기
    const loadWishList = useCallback(async () => {
        if (!loginLevel) return;
        try {
            const resp = await axios.get("/point/main/store/wish/check");
            setWishList(resp.data);
        } catch (e) { console.error(e); }
    }, [loginLevel]);

    useEffect(() => {
        loadItems();
        loadMyItems();
        loadWishList();
    }, [loadItems, loadMyItems, loadWishList]);

    // [구매 핸들러]
    const handleBuy = async (item) => {
        if (!window.confirm(`[${item.pointItemName}] 을(를) 구매하시겠습니까?`)) return;
        try {
            await axios.post("/point/main/store/buy", { buyItemNo: item.pointItemNo });
            toast.success("구매 성공! 🎒보관함을 확인하세요.");
            loadItems(); 
            loadMyItems(); 
            if (refreshPoint) refreshPoint(); 
        } catch (err) {
            toast.error(err.response?.data?.message || "구매 실패 😥");
        }
    };

    // [선물 핸들러]
    const handleGift = async (item) => {
        const targetId = window.prompt("선물을 받을 친구의 ID를 입력하세요.");
        if (!targetId) return;
        if (!window.confirm(`${targetId}님에게 선물하시겠습니까?`)) return;
        
        try {
            await axios.post("/point/main/store/gift", { itemNo: item.pointItemNo, targetId });
            toast.success(`🎁 ${targetId}님에게 선물 발송 완료!`);
            loadItems(); 
            if (refreshPoint) refreshPoint(); 
        } catch (err) {
            toast.error(err.response?.data?.message || "선물 실패 😥");
        }
    };

    // [삭제 핸들러 - 관리자]
    const handleDelete = async (item) => {
        if (!window.confirm(`[${item.pointItemName}] 정말 삭제하시겠습니까?`)) return;
        try {
            await axios.post("/point/main/store/item/delete", { pointItemNo: item.pointItemNo });
            toast.info("상품이 삭제되었습니다. 🗑️");
            loadItems(); 
        } catch (e) { 
            console.error(e);
            toast.error("삭제 실패: " + (e.response?.data?.message || "오류가 발생했습니다.")); 
        }
    };
    
    // [찜 토글 핸들러]
    const handleToggleWish = async (itemNo) => {
        if (!loginLevel) {
            toast.warning("로그인 후 이용 가능합니다. 🔒");
            return;
        }
        try {
            await axios.post("/point/main/store/wish/toggle", { itemNo });
            loadWishList(); 
        } catch (e) { toast.error("찜하기 실패"); }
    };

    return (
        <div className="store-container">
            {/* 상단 헤더 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white fw-bold">
                     popcorn 굿즈 스토어 <span className="text-secondary fs-6 ms-2">({items.length}개의 상품)</span>
                </h4>
                {loginLevel === "관리자" && (
                    <button className="btn btn-outline-light btn-sm fw-bold" onClick={() => setShowAddModal(true)}>
                        + 상품 등록
                    </button>
                )}
            </div>

            {/* 상품 리스트 (그리드) */}
            <div className="goods-grid">
                {items.length === 0 ? (
                    <div className="col-12 text-center p-5 border rounded bg-dark text-secondary">
                        <h3>텅... 🍃</h3>
                        <p>등록된 상품이 없습니다.</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const reqScore = getScore(item.pointItemReqLevel);
                        const canAccess = (myScore >= reqScore); 
                        
                        const ownedCount = myItems.filter(i => i.inventoryItemNo === item.pointItemNo).length;
                        const isUnique = item.pointItemIsLimitedPurchase === 1;
                        const isAlreadyOwned = isUnique && ownedCount > 0;
                        const isWished = wishList.includes(item.pointItemNo); 
                        const isSoldOut = item.pointItemStock <= 0;

                        return (
                            <div className={`goods-card ${(!canAccess && loginLevel !== "관리자") || isSoldOut ? "disabled" : ""}`} key={item.pointItemNo}>
                                
                                {/* 이미지 영역 */}
                                <div className="goods-img-wrapper">
                                    {item.pointItemSrc ? (
                                        <img src={item.pointItemSrc} alt={item.pointItemName} className="goods-img" />
                                    ) : (
                                        <div className="goods-img d-flex align-items-center justify-content-center bg-secondary text-white">
                                            No Image
                                        </div>
                                    )}

                                    <button className="btn-wish" onClick={(e) => { e.stopPropagation(); handleToggleWish(item.pointItemNo); }}>
                                        {isWished ? "❤️" : "🤍"}
                                    </button>

                                    <div className="badge-overlay">
                                        {isUnique && <span className="badge bg-danger">LIMITED</span>}
                                        {ownedCount > 0 && <span className="badge bg-info text-dark">보유중</span>}
                                    </div>

                                    {isSoldOut && (
                                        <div className="badge-soldout">SOLD OUT</div>
                                    )}
                                </div>

                                {/* 정보 영역 */}
                                <div className="goods-info">
                                    <h5 className="goods-title" title={item.pointItemName}>{item.pointItemName}</h5>
                                    <p className="goods-desc">{item.pointItemContent}</p>
                                    
                                    <div className="goods-meta">
                                        {/* ★ [수정] 관리자에게만 재고 표시 */}
                                        {loginLevel === "관리자" && (
                                            <span className={item.pointItemStock < 5 ? "text-danger fw-bold" : ""}>
                                                재고 {item.pointItemStock}
                                            </span>
                                        )}
                                        <span className="badge bg-dark border border-secondary text-secondary">
                                            Lv.{item.pointItemReqLevel}
                                        </span>
                                    </div>

                                    <div className="goods-price mb-3">
                                        {item.pointItemPrice.toLocaleString()} P
                                    </div>

                                    {/* 버튼 그룹 */}
                                    <div className="btn-group-custom">
                                        {canAccess ? (
                                            <>
                                                <button 
                                                    className={`btn-goods buy ${isAlreadyOwned ? "disabled" : ""}`}
                                                    onClick={() => handleBuy(item)} 
                                                    disabled={isSoldOut || isAlreadyOwned}
                                                >
                                                    {isAlreadyOwned ? "보유함" : "구매"}
                                                </button>
                                                <button 
                                                    className="btn-goods gift" 
                                                    onClick={() => handleGift(item)} 
                                                    disabled={isSoldOut}
                                                >
                                                    선물
                                                </button>
                                            </>
                                        ) : (
                                            <button className="btn-goods disabled" disabled>
                                                🔒 등급 제한
                                            </button>
                                        )}
                                    </div>

                                    {loginLevel === "관리자" && (
                                        <div className="admin-controls mt-2 pt-2 border-top border-secondary">
                                            <button className="btn btn-sm btn-outline-warning me-1" onClick={() => setEditTarget(item)}>수정</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)}>삭제</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 모달 렌더링 */}
            {showAddModal && <ProductAdd closeModal={() => setShowAddModal(false)} reload={loadItems} />}
            {editTarget && <ProductEdit target={editTarget} closeModal={() => setEditTarget(null)} reload={loadItems} />}
        </div>
    );
}