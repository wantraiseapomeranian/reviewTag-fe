import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./InventoryView.css";

export default function InventoryView({ refreshPoint }) {
    const [myInven, setMyInven] = useState([]);

    // [1] 인벤토리 목록 불러오기
    const loadInven = useCallback(async () => {
        try {
            const resp = await axios.get("/point/main/store/inventory/my");
            setMyInven(resp.data);
        } catch (e) { 
            console.error("인벤토리 로드 실패:", e); 
        }
    }, []);

    useEffect(() => { 
        loadInven(); 
    }, [loadInven]);

    // [2] 사용 및 장착 핸들러
    const handleUse = async (item) => {
        const targetNo = item.inventoryNo; 
        const type = item.pointItemType;
        let extraValue = null;

        // 아이템 유형별 전처리
        if (type === "CHANGE_NICK") {
            extraValue = window.prompt("변경할 닉네임을 입력해주세요. (2~10자)");
            if (!extraValue) return;
        } 
        else if (["DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME"].includes(type)) { 
            if(item.inventoryEquipped === 'Y') {
                toast.info("이미 착용 중인 아이템입니다.");
                return;
            }
            if (!window.confirm(`[${item.pointItemName}] 스타일을 적용하시겠습니까?`)) return;
        }
        else if (type === "RANDOM_ICON") {
            if (!window.confirm("🎲 아이콘 뽑기를 진행하시겠습니까? (티켓 1장 소모)")) return;
            try {
                const drawResp = await axios.post("/point/icon/draw", { inventoryNo: targetNo });
                const icon = drawResp.data; 
                
                toast.success(
                    <div className="text-center">
                        <p className="mb-1 fw-bold">🎉 {icon.iconRarity} 등급 획득!</p>
                        <img src={icon.iconSrc} style={{width:'60px', height:'60px', borderRadius:'8px', border:'2px solid #eee', objectFit: 'cover'}} alt="icon" />
                        <div className="mt-2 fw-bold text-dark">{icon.iconName}</div>
                    </div>, 
                    { autoClose: 4000 }
                );
                loadInven();
                if (refreshPoint) refreshPoint();
                return;
            } catch (e) { 
                toast.error("뽑기 실패: " + (e.response?.data?.message || "오류 발생")); 
                return;
            }
        }
        else if (type === "VOUCHER") {
            if (!window.confirm("포인트를 충전하시겠습니까?")) return;
        }
        else if (type === "RANDOM_POINT") {
            if (!window.confirm("랜덤 포인트 상자를 여시겠습니까?")) return;
        }
        else {
            if (!window.confirm("아이템을 사용하시겠습니까?")) return;
        }

        // 사용/장착 API 호출
        try {
            const resp = await axios.post("/point/main/store/inventory/use", { 
                inventoryNo: targetNo, 
                extraValue: extraValue 
            });
            
            if (resp.data === "success") {
                toast.success("적용 완료! ✨");
                loadInven(); // 목록 새로고침
                if (refreshPoint) refreshPoint(); // 상단 카드 새로고침
            } else {
                const msg = String(resp.data).startsWith("fail:") ? resp.data.substring(5) : resp.data;
                toast.error(msg);
            }
        } catch (e) { 
            toast.error("처리 중 오류가 발생했습니다."); 
        }
    };

    // [3] 장착 해제 핸들러 (리프레시 포함)
    const handleUnequip = async (item) => {
        if (!window.confirm(`[${item.pointItemName}] 장착을 해제하시겠습니까?`)) return;

        try {
            const resp = await axios.post("/point/main/store/inventory/unequip", {
                inventoryNo: item.inventoryNo
            });

            if (resp.data === "success") {
                toast.success("장착 해제되었습니다.");
                loadInven(); // 목록 새로고침
                if (refreshPoint) refreshPoint(); // 상단 카드 새로고침 (중요)
            } else {
                const msg = String(resp.data).startsWith("fail:") ? resp.data.substring(5) : resp.data;
                toast.error(msg);
            }
        } catch (e) {
            toast.error("해제 중 오류가 발생했습니다.");
        }
    };

    // [4] 환불 핸들러
    const handleCancel = async (item) => {
        if (!window.confirm("구매를 취소하고 환불하시겠습니까?")) return;
        try {
            await axios.post("/point/main/store/cancel", { inventoryNo: item.inventoryNo });
            toast.info("환불이 완료되었습니다. 💸");
            loadInven();
            if (refreshPoint) refreshPoint();
        } catch (err) { 
            toast.error("환불 실패: " + (err.response?.data?.message || "오류")); 
        }
    };

    // [5] 아이템 버리기 핸들러
    const handleDiscard = async (item) => {
        if (!window.confirm("정말 버리시겠습니까? (복구 불가)")) return;
        try {
            await axios.post("/point/main/store/inventory/delete", { inventoryNo: item.inventoryNo });
            toast.success("아이템을 버렸습니다.");
            loadInven();
        } catch (err) { 
            toast.error("삭제 실패"); 
        }
    };

    return (
        <div className="inven-container mt-3">
            <h5 className="text-white fw-bold mb-4 px-2">
                🎒 나의 보관함 <span className="text-secondary small">({myInven.length})</span>
            </h5>
            
            {myInven.length === 0 ? (
                <div className="inven-empty">
                    <span className="inven-empty-icon">📦</span>
                    <h5>보관함이 비어있습니다.</h5>
                    <p>스토어에서 아이템을 구매해보세요!</p>
                </div>
            ) : (
                <div className="inven-grid">
                    {myInven.map((item) => {
                        const isEquipped = item.inventoryEquipped === 'Y';
                        const isDecoItem = ["DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME"].includes(item.pointItemType);

                        return (
                            <div className={`inven-card ${isEquipped ? 'equipped-card' : ''}`} key={item.inventoryNo}>
                                <div className="inven-img-box">
                                    {item.pointItemSrc ? 
                                        <img src={item.pointItemSrc} className="inven-img" alt={item.pointItemName}/> 
                                        : <div className="no-img">No Img</div>
                                    }
                                    <span className="inven-count-badge">x{item.inventoryQuantity}</span>
                                    {isEquipped && <span className="badge bg-success equipped-badge">착용중</span>}
                                </div>
                                    
                                <div className="inven-info">
                                    <h6 className="inven-name" title={item.pointItemName}>{item.pointItemName}</h6>
                                    <span className="inven-type">{item.pointItemType}</span>
                                </div>

                                <div className="inven-actions">
                                    {/* 사용/장착 버튼 */}
                                    {["CHANGE_NICK", "LEVEL_UP", "RANDOM_POINT", "VOUCHER", "DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME", "RANDOM_ICON"].includes(item.pointItemType) && (
                                        <button 
                                            className={`btn-inven use ${isEquipped ? 'disabled' : ''}`} 
                                            onClick={() => handleUse(item)}
                                            disabled={isEquipped}
                                        >
                                            {item.pointItemType === 'RANDOM_ICON' ? '뽑기' : 
                                             isDecoItem ? (isEquipped ? '사용중' : '장착') : '사용'}
                                        </button>
                                    )}
                                    
                                    {/* 장착 해제 버튼 */}
                                    {isEquipped && isDecoItem && (
                                        <button className="btn-inven unequip" onClick={() => handleUnequip(item)}>
                                            장착 해제
                                        </button>
                                    )}

                                    {/* 환불/버리기 버튼 (미착용 시에만) */}
                                    {!isEquipped && (
                                        <>
                                            <button className="btn-inven refund" onClick={() => handleCancel(item)}>환불</button>
                                            <button className="btn-inven delete" onClick={() => handleDiscard(item)}>버리기</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}