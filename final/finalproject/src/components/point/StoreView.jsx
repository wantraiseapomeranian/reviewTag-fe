import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
import { toast } from "react-toastify";
import { useSetAtom } from "jotai";
import { pointRefreshAtom } from "../../utils/jotai"; 
import Swal from "sweetalert2"; 
import "./StoreView.css";

function getScore(level) {
    if (level === "관리자") return 99;
    if (level === "우수회원") return 2;
    if (level === "일반회원") return 1;
    return 0; 
}

export default function StoreView({ loginLevel, refreshPoint }) {
    const [items, setItems] = useState([]);       
    const [myItems, setMyItems] = useState([]);   
    const [wishList, setWishList] = useState([]); 
    const [showAddModal, setShowAddModal] = useState(false); 
    const [editTarget, setEditTarget] = useState(null);      
    const setPointRefresh = useSetAtom(pointRefreshAtom);

    const loadData = useCallback(async () => {
        try {
            const [itemResp, myResp, wishResp] = await Promise.all([
                axios.get("/point/main/store"),
                loginLevel ? axios.get("/point/main/store/inventory/my") : Promise.resolve({ data: [] }),
                loginLevel ? axios.get("/point/main/store/wish/check") : Promise.resolve({ data: [] })
            ]);
            setItems(itemResp.data);
            setMyItems(myResp.data);
            setWishList(wishResp.data);
        } catch (e) { console.error("데이터 로딩 실패", e); }
    }, [loginLevel]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleBuy = async (item) => {
        const res = await Swal.fire({ title: '구매 확인', text: `[${item.pointItemName}]을 구매하시겠습니까?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#f1c40f', background: '#1a1a1a', color: '#fff' });
        if (!res.isConfirmed) return;
        try {
            await axios.post("/point/main/store/buy", { buyItemNo: item.pointItemNo });
            toast.success("구매 완료! 🎒");
            setPointRefresh(v => v + 1);
            if (refreshPoint) refreshPoint();
            loadData();
        } catch (e) { Swal.fire({ icon: 'error', text: e.response?.data || "구매 실패", background: '#1a1a1a', color: '#fff' }); }
    };

    const handleGift = async (item) => {
        const { value: targetId } = await Swal.fire({ title: '아이템 선물', input: 'text', inputLabel: '상대방 ID 입력', showCancelButton: true, confirmButtonColor: '#f1c40f', background: '#1a1a1a', color: '#fff' });
        if (!targetId) return;
        try {
            await axios.post("/point/main/store/gift", { itemNo: item.pointItemNo, targetId });
            toast.success(`${targetId}님께 선물 완료!`);
            setPointRefresh(v => v + 1);
            loadData();
        } catch (e) { toast.error(e.response?.data || "실패"); }
    };

    const handleToggleWish = async (itemNo) => {
        if (!loginLevel) return toast.warning("로그인이 필요합니다.");
        try {
            await axios.post("/point/main/store/wish/toggle", { itemNo });
            loadData();
        } catch (e) { toast.error("찜하기 실패"); }
    };

    return (
        <div className="store-container">
            <div className="store-header">
                <h4 className="store-title">popcorn 스토어 <span>({items.length})</span></h4>
                {loginLevel === "관리자" && <button className="btn-add" onClick={() => setShowAddModal(true)}>+ 상품 등록</button>}
            </div>

            <div className="goods-grid">
                {items.map((item) => {
                    const myScore = getScore(loginLevel);
                    const reqScore = getScore(item.pointItemReqLevel);
                    const canAccess = (myScore >= reqScore);
                    const isSoldOut = item.pointItemStock <= 0;

                    // 🔴 보유 상태 확인 (Number 형변환으로 정확도 상승)
                    const isOwned = myItems.some(i => Number(i.inventoryItemNo) === Number(item.pointItemNo));
                    const isLimitedAndOwned = isOwned && item.pointItemIsLimitedPurchase === 1;

                    return (
                        <div className={`goods-card ${isSoldOut ? "disabled" : ""}`} key={item.pointItemNo}>
                            <div className="goods-img-box">
                                <img src={item.pointItemSrc || "/default.png"} alt="item" />
                                
                                {/* 🔴 찜 버튼 복구 */}
                                <button className="wish-overlay" onClick={() => handleToggleWish(item.pointItemNo)}>
                                    {wishList.includes(item.pointItemNo) ? "❤️" : "🤍"}
                                </button>

                                {/* 🔴 배지 오버레이 (보유중 표시) */}
                                <div className="badge-overlay">
                                    {isOwned && <span className="badge-own">보유중</span>}
                                    {isSoldOut && <span className="badge-soldout">품절</span>}
                                </div>
                            </div>
                            <div className="goods-content">
                                <h5 className="item-name">{item.pointItemName}</h5>
                                <div className="item-meta-row">
                                    <span className="badge-lv">Lv.{item.pointItemReqLevel}</span>
                                    {item.pointItemDailyLimit > 0 && <span className="badge-daily">일일 {item.pointItemDailyLimit}개</span>}
                                </div>
                                <div className="item-bottom-group">
                                    <div className="item-price">{item.pointItemPrice.toLocaleString()} P</div>
                                    <div className="item-buttons">
                                        {canAccess ? (
                                            <>
                                                <button 
                                                    className={`btn-buy ${isLimitedAndOwned ? "owned" : ""}`} 
                                                    onClick={() => handleBuy(item)} 
                                                    disabled={isSoldOut || isLimitedAndOwned}
                                                >
                                                    {isLimitedAndOwned ? "보유함" : "구매"}
                                                </button>
                                                <button className="btn-gift" onClick={() => handleGift(item)} disabled={isSoldOut}>선물</button>
                                            </>
                                        ) : ( <button className="btn-locked" disabled>🔒 등급 부족</button> )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showAddModal && <ProductAdd closeModal={() => setShowAddModal(false)} reload={loadData} />}
            {editTarget && <ProductEdit target={editTarget} closeModal={() => setEditTarget(null)} reload={loadData} />}
        </div>
    );
}