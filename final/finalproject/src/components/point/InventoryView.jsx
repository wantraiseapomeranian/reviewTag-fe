import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

// onRefund: 환불/사용/삭제 후 정보 갱신용 함수
export default function InventoryView({ onRefund }) {
    const [myInven, setMyInven] = useState([]);

    const loadInven = useCallback(async () => {
        try {
            const resp = await axios.get("/point/store/inventory/my");
            setMyInven(resp.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { loadInven(); }, [loadInven]);

    // 그룹화 로직 (이전과 동일)
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

   // 1. [사용] 핸들러
    const handleUse = async (group) => {
        const targetNo = group.inventoryIds[0];
        let extraValue = null;

        // ★ 아이템 유형별 로직
        if (group.pointInventoryItemType === "CHANGE_NICK") {
            
            // 1) 입력 받기
            extraValue = window.prompt("변경할 닉네임을 입력하세요. (한글/숫자 2~10자)");
            if (!extraValue) return; // 취소

            // 2) ★ 정규식 검사 (한글 + 숫자만 허용) ★
            // 조건: 한글(가-힣), 숫자(0-9) 포함 / 길이 2~10자 / 영문 불가 / 공백 불가
            const regex = /^[가-힣0-9]{2,10}$/;

            if (!regex.test(extraValue)) {
                alert("닉네임 형식이 올바르지 않습니다.\n- 한글과 숫자만 가능 (영문 불가)\n- 2~10글자\n- 특수문자 및 공백 불가");
                return; // 중단
            }
        } 
        else if (group.pointInventoryItemType === "FOOD") {
             alert("기프티콘 바코드를 확인합니다. (준비중)");
             return;
        }
        else {
            if(!window.confirm(`[${group.pointItemName}] 아이템을 사용하시겠습니까?`)) return;
        }

        // 3) 서버 전송
        try {
            const resp = await axios.post("/point/store/inventory/use", { 
                inventoryNo: targetNo, 
                extraValue: extraValue 
            });

            if (resp.data === "success") {
                alert("아이템 사용 완료! (닉네임이 변경되었습니다 ✨)");
                loadInven(); // 목록 갱신
                if (onRefund) onRefund(); // 상단 닉네임/포인트 갱신
            } else {
                alert("사용 실패: " + resp.data);
            }
        } catch (e) { 
            console.error(e);
            alert("오류가 발생했습니다."); 
        }
    };

    // 2. [환불] 핸들러
    const handleCancel = async (group) => {
        const targetNo = group.inventoryIds[0];
        if (!window.confirm(`[${group.pointItemName}] 1개를 환불하시겠습니까?\n(포인트 복구)`)) return;
        try {
            await axios.post("/point/store/cancel", { inventoryNo: targetNo });
            alert("환불 완료");
            loadInven();
            if (onRefund) onRefund();
        } catch (err) { alert("환불 실패"); }
    };

    // 3. [삭제] 핸들러
    const handleDiscard = async (group) => {
        const targetNo = group.inventoryIds[0];
        if (!window.confirm(`[${group.pointItemName}] 1개를 정말 버리시겠습니까?\n(복구 불가, 포인트 반환 X)`)) return;
        try {
            await axios.post("/point/store/inventory/delete", { inventoryNo: targetNo });
            alert("삭제(폐기) 완료");
            loadInven();
        } catch (err) { alert("삭제 실패"); }
    };

    return (
        <div className="row">
            {groupedInven.length === 0 ? (
                <div className="col-12 text-center p-5 bg-light rounded m-3"><h5 className="text-muted">보관함이 비어있습니다.</h5></div>
            ) : (
                groupedInven.map((group) => (
                    <div className="col-md-6 mb-3" key={group.pointInventoryItemNo}>
                        <div className="card shadow-sm h-100 border-0">
                            <div className="card-body d-flex align-items-center">
                                {/* 이미지 */}
                                <div className="flex-shrink-0 me-3 position-relative" style={{ width: "80px", height: "80px" }}>
                                    {group.pointItemSrc ? 
                                        <img src={group.pointItemSrc} className="rounded w-100 h-100" style={{objectFit:'cover'}} alt=""/> 
                                        : <div className="bg-secondary text-white rounded w-100 h-100 d-flex align-items-center justify-content-center">Img</div>}
                                    <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary border border-light shadow-sm">{group.count}</span>
                                </div>
                                
                                {/* 정보 */}
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="fw-bold text-truncate mb-1">{group.pointItemName}</h6>
                                    <p className="text-muted small mb-1">{group.pointInventoryItemType}</p>
                                    <p className="text-muted small mb-0">{new Date(group.pointInventoryPurchaseDate).toLocaleDateString()} 구매</p>
                                </div>
                                
                                {/* ★ 버튼 그룹 (사용 / 환불 / 삭제) */}
                                <div className="d-flex flex-column gap-1 ms-2">
                                    {/* 사용 버튼: 특정 타입일 때만 표시하거나, 모두 표시하되 로직으로 제어 */}
                                    {["CHANGE_NICK", "LEVEL_UP", "RANDOM"].includes(group.pointInventoryItemType) && (
                                        <button className="btn btn-success btn-sm py-0" onClick={() => handleUse(group)}>
                                            사용
                                        </button>
                                    )}
                                    
                                    <button className="btn btn-outline-primary btn-sm py-0" onClick={() => handleCancel(group)}>
                                        환불
                                    </button>
                                    
                                    <button className="btn btn-outline-secondary btn-sm py-0" onClick={() => handleDiscard(group)}>
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}