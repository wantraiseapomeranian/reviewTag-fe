import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function InventoryView({ refreshPoint }) {
    const [myInven, setMyInven] = useState([]);

    const loadInven = useCallback(async () => {
        try {
            const resp = await axios.get("/point/store/inventory/my");
            setMyInven(resp.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { loadInven(); }, [loadInven]);

    // 아이템 그룹화
    const groupedInven = useMemo(() => {
        const groups = {};
        myInven.forEach((item) => {
            const key = item.pointInventoryItemNo;
            if (!groups[key]) groups[key] = { ...item, count: 0, inventoryIds: [] };
            groups[key].count += 1;
            groups[key].inventoryIds.push(item.pointInventoryNo);
        });
        return Object.values(groups);
    }, [myInven]);

    // [사용] 핸들러
    const handleUse = async (group) => {
        const targetNo = group.inventoryIds[0];
        const type = group.pointInventoryItemType;
        let extraValue = null;

        // 1. 유형별 로직
        if (type === "CHANGE_NICK") {
            extraValue = window.prompt("변경할 닉네임을 입력해주세요. (2~10자)");
            if (!extraValue) return;
        } 
        else if (type === "DECO_NICK") { 
            const choice = window.prompt("1.무지개 2.골드 3.네온");
            if (!choice) return;
            // 입력값 검증
            if(!["1","2","3"].includes(choice.trim())) return toast.warning("1~3번 중 선택해주세요.");
            extraValue = choice.trim();
        }
else if (type === "ICON_GACHA") {
            // ★ [뽑기 로직 수정] 한 번의 요청으로 안전하게 처리
            if (!window.confirm("🎲 아이콘 뽑기를 진행하시겠습니까? (티켓 1장 소모)")) return;
            
            try {
                // (1) 뽑기 요청 (티켓 번호를 같이 보냄)
                // 서버에서 '티켓 차감' + '아이콘 지급'을 동시에 수행함
                const drawResp = await axios.post("/point/icon/draw", { 
                    inventoryNo: targetNo 
                });
                
                const icon = drawResp.data;

                // (2) 결과 보여주기
                toast.success(
                    <div className="text-center">
                        <p className="mb-1 fw-bold">🎉 {icon.iconRarity} 등급 획득!</p>
                        <img 
                            src={icon.iconSrc} 
                            style={{width:'60px', height:'60px', borderRadius:'8px', border:'2px solid #eee', objectFit: 'cover'}} 
                            alt="icon" 
                        />
                        <div className="mt-2 fw-bold text-dark">{icon.iconName}</div>
                    </div>, 
                    { autoClose: 4000, hideProgressBar: false }
                );
                
                loadInven(); // 목록 갱신 (티켓 사라짐 확인)

            } catch (e) {
                console.error(e);
                // 실패하면 티켓이 안 사라짐 (안전!)
                toast.error("뽑기 실패: " + (e.response?.data?.message || "오류 발생"));
            }
            return; 
        }
        else if (type === "VOUCHER") {
            if (!window.confirm("충전하시겠습니까?")) return;
        }
        else if (type === "RANDOM_POINT") {
            if (!window.confirm("개봉하시겠습니까?")) return;
        }
        else {
            if (!window.confirm("사용하시겠습니까?")) return;
        }

        // 2. 일반 아이템 사용 요청
        try {
            const resp = await axios.post("/point/store/inventory/use", { inventoryNo: targetNo, extraValue: extraValue });
            if (resp.data === "success") {
                toast.success("사용 완료!");
                loadInven();
                if (refreshPoint) refreshPoint();
            } else {
                // "fail:사유" 처리
                const msg = resp.data.startsWith("fail:") ? resp.data.substring(5) : resp.data;
                toast.error(msg);
            }
        } catch (e) { toast.error("오류 발생"); }
    };

    // [환불]
    const handleCancel = async (group) => {
        if (!window.confirm("환불하시겠습니까?")) return;
        try {
            await axios.post("/point/store/cancel", { inventoryNo: group.inventoryIds[0] });
            toast.info("환불 완료");
            loadInven();
            if (refreshPoint) refreshPoint();
        } catch (err) { toast.error("실패"); }
    };

    // [삭제]
    const handleDiscard = async (group) => {
        if (!window.confirm("삭제하시겠습니까? (복구 불가)")) return;
        try {
            await axios.post("/point/store/inventory/delete", { inventoryNo: group.inventoryIds[0] });
            toast.success("삭제 완료");
            loadInven();
        } catch (err) { toast.error("실패"); }
    };

    return (
        <div className="row">
            {groupedInven.length === 0 ? <div className="p-5 text-center text-muted">보관함이 비어있습니다.</div> : 
            groupedInven.map((group) => (
                <div className="col-md-6 mb-3" key={group.pointInventoryItemNo}>
                    <div className="card shadow-sm h-100 border-0">
                        <div className="card-body d-flex align-items-center">
                            <div className="flex-shrink-0 me-3 position-relative" style={{ width: "80px", height: "80px" }}>
                                {group.pointItemSrc ? 
                                    <img src={group.pointItemSrc} className="rounded w-100 h-100" style={{objectFit:'cover'}} alt=""/> 
                                    : <div className="bg-secondary text-white rounded w-100 h-100 d-flex align-items-center justify-content-center">Img</div>}
                                <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary border border-light">{group.count}</span>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                                <h6 className="fw-bold text-truncate mb-1">{group.pointItemName}</h6>
                                <p className="text-muted small mb-0">{group.pointInventoryItemType}</p>
                            </div>
                            <div className="d-flex flex-column gap-1 ms-2">
                                {["CHANGE_NICK", "LEVEL_UP", "RANDOM_POINT", "VOUCHER", "DECO_NICK", "ICON_GACHA"].includes(group.pointInventoryItemType) && (
                                    <button className={`btn btn-sm py-0 ${group.pointInventoryItemType==='ICON_GACHA'?'btn-warning':'btn-success'}`} onClick={() => handleUse(group)}>
                                        {group.pointInventoryItemType === 'ICON_GACHA' ? '뽑기' : group.pointInventoryItemType === 'DECO_NICK' ? '장착' : '사용'}
                                    </button>
                                )}
                                <button className="btn btn-outline-primary btn-sm py-0" onClick={() => handleCancel(group)}>환불</button>
                                <button className="btn btn-outline-secondary btn-sm py-0" onClick={() => handleDiscard(group)}>삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}