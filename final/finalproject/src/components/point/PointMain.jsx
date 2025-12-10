import { useState, useEffect, useCallback } from "react";
import { useAtomValue } from "jotai";
import { loginIdState, loginLevelState } from "../../utils/jotai";
import axios from "axios";
// CSS와 컴포넌트 임포트
import "./PointMain.css";
import AttendanceCalendar from "./AttendanceCalendar";
import StoreView from "./StoreView";
import InventoryView from "./InventoryView";
import HistoryView from "./HistoryView";
import WishlistView from "./WishlistView";

export default function PointMain() {
    const loginId = useAtomValue(loginIdState);
    const loginLevel = useAtomValue(loginLevelState);
    
    const [tab, setTab] = useState("store");
    const [myPoint, setMyPoint] = useState(0);
    const [myNickname, setMyNickname] = useState("");
    
    const [isChecked, setIsChecked] = useState(false);
    const [showStamp, setShowStamp] = useState(false); // 배너 도장 애니메이션
    
    // 달력 새로고침용 트리거 (숫자가 바뀌면 달력이 다시 로딩됨)
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

    // 내 정보 로드
    const loadMyInfo = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get(`/member/mypage/${loginId}`);
            const data = resp.data || {}; 
            setMyPoint(data.memberPoint || 0);
            setMyNickname(data.memberNick || data.memberNickname || loginId); 
        } catch (e) { console.error(e); }
    }, [loginId]);

    // 오늘 출석 여부 확인
    const checkAttendanceStatus = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/attendance/status");
            setIsChecked(resp.data); // true or false
        } catch(e) { console.error(e); }
    }, [loginId]);

    useEffect(() => {
        loadMyInfo();
        checkAttendanceStatus();
    }, [loadMyInfo, checkAttendanceStatus]);

    // [출석체크 실행]
    const handleAttendance = async () => {
        if (!loginId) return alert("로그인이 필요합니다.");
        
        try {
            const resp = await axios.post("/point/main/attendance/check");
            
            // Controller에서 "success:..." 같은 문자열을 반환한다고 가정
            if (resp.data && typeof resp.data === 'string' && resp.data.startsWith("success")) {
              const point = resp.data.split(":")[1]?.trim() || "100";
                
                // 1. 도장 애니메이션 시작
                setShowStamp(true);
                setIsChecked(true); 
                
                // 2. 정보 갱신 (포인트, 달력)
                loadMyInfo();
                setCalendarRefreshKey(prev => prev + 1); // ⭐ 달력 갱신 트리거!
                
                // 3. 알림 (0.5초 뒤)
                setTimeout(() => {
                    alert(`🎉 출석체크 완료! +${point}P 지급되었습니다.`);
                }, 500);
            } else {
                // 이미 했거나 실패 시 메시지
                const msg = resp.data.includes(":") ? resp.data.split(":")[1] : resp.data;
                alert(msg);
            }
        } catch (e) { 
            alert(e.response?.data || "출석체크 중 오류가 발생했습니다."); 
        }
    };

    return (
        <div className="container py-4" style={{maxWidth: '800px'}}>
            
            {/* 1. 상단 정보 (헤더) */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h4 className="fw-bold mb-0 text-secondary">Point Lounge</h4>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="fw-bold text-dark">
                            {myNickname}님 <span className="badge bg-secondary ms-1">{loginLevel}</span>
                        </div>
                        <small className="text-muted">오늘도 환영합니다!</small>
                    </div>
                    <div className="bg-light px-4 py-2 rounded-pill border shadow-sm text-center">
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>MY POINT</small>
                        <strong className="text-primary fs-5">{(myPoint || 0).toLocaleString()} P</strong>
                    </div>
                </div>
            </div>

            {/* 2. 메인 배너 (출석 버튼 & 큰 도장) */}
            <div className={`card shadow-sm border-0 mb-4 attendance-card ${isChecked ? "checked" : "unchecked"}`}>
                <div className="card-body p-4 text-center">
                    
                    {/* 💮 큰 도장 (성공 시 또는 이미 했을 때 표시) */}
                    {(showStamp || isChecked) && (
                        <div className="attendance-stamp">
                            COMPLETED
                        </div>
                    )}

                    <h3 className="fw-bold mb-2">
                        {isChecked ? "✅ 오늘 출석 완료!" : "📅 매일매일 출석체크"}
                    </h3>
                    <p className="text-muted mb-4">
                        {isChecked 
                            ? "내일 또 방문해서 포인트를 받으세요!" 
                            : "지금 버튼을 누르고 포인트를 획득하세요!"}
                    </p>
                    <button 
                        className={`btn btn-lg px-5 rounded-pill fw-bold ${isChecked ? "btn-secondary" : "btn-primary"}`}
                        onClick={handleAttendance}
                        disabled={isChecked}
                        style={{minWidth: '200px', transition: "all 0.3s"}}
                    >
                        {isChecked ? "참여 완료" : "출석하고 포인트 받기"}
                    </button>
                </div>
            </div>

            {/* 3. 📅 달력 섹션 (배너 바로 아래 배치) */}
            <div className="mb-5">
                {/* key를 넘겨서 강제로 리렌더링할 수도 있지만, props로 트리거를 넘김 */}
                <AttendanceCalendar refreshTrigger={calendarRefreshKey} />
            </div>

            {/* 4. 하단 탭 메뉴 */}
            <ul className="nav nav-tabs nav-fill mb-0">
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'store' ? 'active fw-bold' : ''}`} onClick={() => setTab('store')}>
                        🛒 아이템 상점
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'wish' ? 'active fw-bold' : ''}`} onClick={() => setTab('wish')}>
                        💖 찜 목록
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

            {/* 5. 탭 컨텐츠 영역 */}
            <div className="tab-content-area">
                {tab === "store" && <StoreView loginLevel={loginLevel} refreshPoint={loadMyInfo} />}
                {tab === "wish" && <WishlistView />}
                {tab === "inventory" && <InventoryView onRefund={loadMyInfo} />}
                {tab === "history" && <HistoryView />}
            </div>
        </div>
    );
}