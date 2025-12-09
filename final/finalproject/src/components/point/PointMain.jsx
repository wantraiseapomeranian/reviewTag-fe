import { useState, useEffect, useCallback } from "react";
import { useAtomValue } from "jotai";
import { loginIdState, loginLevelState } from "../../utils/jotai";
import axios from "axios";

// 컴포넌트 임포트 (경로 확인 필수!)
import StoreView from "./StoreView";
import InventoryView from "./InventoryView";
import HistoryView from "./HistoryView";

export default function PointMain() {
    const loginId = useAtomValue(loginIdState);
    const loginLevel = useAtomValue(loginLevelState);
    
    // 탭 상태 유지 (세션 스토리지 사용 추천 - 선택사항)
    const [tab, setTab] = useState("store");
    const [myPoint, setMyPoint] = useState(0);
    const [myNickname, setMyNickname] = useState(""); 

    // 내 정보(포인트+닉네임) 불러오기
    const loadMyInfo = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get(`/member/mypage/${loginId}`);
            
            // 데이터가 null일 경우 방지
            const data = resp.data || {}; 
            
            setMyPoint(data.memberPoint || 0);
            // DTO 이름이 memberNick 인지 memberNickname 인지 몰라서 둘 다 체크
            setMyNickname(data.memberNick || data.memberNickname || ""); 
        } catch (e) {
            console.error("정보 로드 실패:", e);
        }
    }, [loginId]);

    useEffect(() => {
        loadMyInfo();
    }, [loadMyInfo]);

    return (
        <div className="container py-5">
            {/* 상단 헤더 */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h2 className="fw-bold mb-0">🎁 포인트 라운지</h2>
                <div className="bg-light px-4 py-2 rounded-pill border shadow-sm">
                    <span className="text-muted me-2 small">MY POINT</span>
                    {/* ★ 안전장치 추가: (myPoint || 0) */}
                    <strong className="text-primary fs-5">{(myPoint || 0).toLocaleString()} P</strong>
                </div>
            </div>
            
            {/* 탭 네비게이션 */}
            <ul className="nav nav-pills nav-fill mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'store' ? 'active fw-bold' : ''}`} onClick={() => setTab('store')}>
                        🛒 아이템 상점
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'inventory' ? 'active fw-bold' : ''}`} onClick={() => setTab('inventory')}>
                        🎒 내 보관함
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'history' ? 'active fw-bold' : ''}`} onClick={() => setTab('history')}>
                        📜 이용 내역
                    </button>
                </li>
            </ul>

            {/* 화면 전환 */}
            <div className="mt-3">
                {tab === "store" && (
                    <StoreView 
                        loginLevel={loginLevel} 
                        loginNickname={myNickname} 
                        refreshPoint={loadMyInfo} 
                    />
                )}
                {tab === "inventory" && <InventoryView onRefund={loadMyInfo} />}
                {tab === "history" && <HistoryView />}
            </div>
        </div>
    );
}