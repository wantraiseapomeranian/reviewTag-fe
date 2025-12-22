import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; 
import "./InventoryView.css";

export default function InventoryView({ refreshPoint }) {
    const [myInven, setMyInven] = useState([]);

    // [1] 인벤토리 목록 로드
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
            const { value: text } = await Swal.fire({
                title: '닉네임 변경',
                input: 'text',
                inputLabel: '새로운 닉네임을 입력해주세요 (2~10자)',
                inputPlaceholder: '변경할 닉네임 입력',
                showCancelButton: true,
                confirmButtonText: '변경하기',
                cancelButtonText: '취소',
                inputValidator: (value) => {
                    if (!value || value.length < 2 || value.length > 10) {
                        return '2~10자 사이의 닉네임을 입력해야 합니다!';
                    }
                }
            });
            if (!text) return;
            extraValue = text;
        } 
        else if (type === "HEART_RECHARGE") {
            const result = await Swal.fire({
                title: '하트 충전',
                text: `[${item.pointItemName}]을 사용하여 하트 5개를 충전하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '충전하기',
                cancelButtonText: '취소'
            });
            if (!result.isConfirmed) return;
        }
        else if (["DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME"].includes(type)) { 
            if(item.inventoryEquipped === 'Y') {
                toast.info("이미 착용 중인 아이템입니다.");
                return;
            }
            const result = await Swal.fire({
                title: '스타일 적용',
                text: `[${item.pointItemName}] 아이템을 장착하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '장착',
                cancelButtonText: '취소'
            });
            if (!result.isConfirmed) return;
        }
        else if (type === "RANDOM_ICON") {
            const result = await Swal.fire({
                title: '아이콘 뽑기',
                text: "🎲 아이콘 뽑기 티켓을 사용하시겠습니까?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: '뽑기 시작!',
                cancelButtonText: '나중에'
            });
            if (!result.isConfirmed) return;

            try {
                const drawResp = await axios.post("/point/icon/draw", { inventoryNo: targetNo });
                const icon = drawResp.data; 
                
                await Swal.fire({
                    title: `🎉 ${icon.iconRarity} 등급 획득!`,
                    text: `[${icon.iconName}] 아이콘을 얻었습니다.`,
                    imageUrl: icon.iconSrc,
                    imageWidth: 100,
                    imageHeight: 100,
                    imageAlt: 'icon',
                    confirmButtonText: '확인',
                    backdrop: `rgba(0,0,123,0.4) url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXpueG94bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbMubM4/giphy.gif") center center no-repeat`
                });
                
                loadInven();
                if (refreshPoint) refreshPoint();
                return;
            } catch (e) { 
                toast.error("뽑기 실패: " + (e.response?.data?.message || "오류 발생")); 
                return;
            }
        }
        else {
            const result = await Swal.fire({
                title: '아이템 사용',
                text: `[${item.pointItemName}]을(를) 사용하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '사용',
                cancelButtonText: '취소'
            });
            if (!result.isConfirmed) return;
        }

        // 실제 서버 통신
        try {
            const resp = await axios.post("/point/main/store/inventory/use", { 
                inventoryNo: targetNo, 
                extraValue: extraValue 
            });
            
            if (resp.data === "success") {
                toast.success("처리가 완료되었습니다! ✨");
                loadInven(); 
                if (refreshPoint) refreshPoint(); 
            } else {
                const msg = String(resp.data).startsWith("fail:") ? resp.data.substring(5) : resp.data;
                toast.error(msg);
            }
        } catch (e) { 
            toast.error("처리 중 오류가 발생했습니다."); 
        }
    };

    // [3] 장착 해제 핸들러
    const handleUnequip = async (item) => {
        const result = await Swal.fire({
            title: '장착 해제',
            text: `[${item.pointItemName}] 장착을 해제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '해제',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                const resp = await axios.post("/point/main/store/inventory/unequip", {
                    inventoryNo: item.inventoryNo
                });

                if (resp.data === "success") {
                    toast.success("장착 해제되었습니다.");
                    loadInven(); 
                    if (refreshPoint) refreshPoint(); 
                } else {
                    toast.error("해제 실패");
                }
            } catch (e) { toast.error("오류 발생"); }
        }
    };

    // [4] 환불 핸들러
    const handleCancel = async (item) => {
        const result = await Swal.fire({
            title: '구매 취소/환불',
            text: "정말 환불하시겠습니까? 포인트가 즉시 복구됩니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: '환불하기',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                await axios.post("/point/main/store/cancel", { inventoryNo: item.inventoryNo });
                toast.info("환불 처리가 완료되었습니다. 💸");
                loadInven();
                if (refreshPoint) refreshPoint();
            } catch (err) { toast.error("환불 실패"); }
        }
    };

    // [5] 아이템 버리기 핸들러
    const handleDiscard = async (item) => {
        const result = await Swal.fire({
            title: '아이템 버리기',
            text: "정말 이 아이템을 삭제하시겠습니까? (복구 불가)",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '네, 버립니다',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                await axios.post("/point/main/store/inventory/delete", { inventoryNo: item.inventoryNo });
                toast.success("아이템을 성공적으로 버렸습니다.");
                loadInven();
            } catch (err) { toast.error("삭제 실패"); }
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
                                    {isEquipped && <span className="equipped-badge-overlay">ON</span>}
                                </div>
                                    
                                <div className="inven-info">
                                    <h6 className="inven-name" title={item.pointItemName}>
                                        {item.pointItemName}
                                    </h6>
                                    <span className="inven-type">{item.pointItemType}</span>
                                </div>

                                <div className="inven-actions">
                                    {["CHANGE_NICK", "LEVEL_UP", "RANDOM_POINT", "VOUCHER", "DECO_NICK", "DECO_BG", "DECO_ICON", "DECO_FRAME", "RANDOM_ICON", "HEART_RECHARGE"].includes(item.pointItemType) && (
                                        <button 
                                            className={`btn-inven use`} 
                                            onClick={() => handleUse(item)}
                                            disabled={isEquipped && isDecoItem}
                                        >
                                            {item.pointItemType === 'RANDOM_ICON' ? '뽑기' : 
                                             isDecoItem ? (isEquipped ? '사용중' : '장착') : '사용'}
                                        </button>
                                    )}
                                    
                                    {isEquipped && isDecoItem && (
                                        <button className="btn-inven unequip" onClick={() => handleUnequip(item)}>
                                            해제
                                        </button>
                                    )}

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