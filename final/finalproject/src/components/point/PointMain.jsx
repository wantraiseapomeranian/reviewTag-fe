    import { useEffect, useState, useCallback } from "react";
    import { useAtomValue } from "jotai";
    import { loginIdState, loginLevelState } from "../../utils/jotai";
    import axios from "axios";
    import { ToastContainer, toast } from "react-toastify";
    import "react-toastify/dist/ReactToastify.css";
    import "./PointMain.css"; 

    // 컴포넌트 임포트
    import AttendanceCalendar from "./AttendanceCalendar";
    import StoreView from "./StoreView";
    import InventoryView from "./InventoryView";
    import HistoryView from "./HistoryView";
    import WishlistView from "./WishlistView";
    import Donate from "./Donate"; 
    import Roulette from "./Roulette"; 
    import MyIconView from "./MyIconView"; 
    import DailyQuest from "./DailyQuest"; 

    // ★ [수정] 관리자 제거 -> 랭킹 페이지 추가
    import PointRankingPage from "./PointRanking"; 
    import StoreProfile from "./StoreProfile";

    export default function PointMain() {
        
        const loginId = useAtomValue(loginIdState);
        const loginLevel = useAtomValue(loginLevelState);
        // const isAdmin = loginLevel === "관리자"; // 관리자 탭 삭제로 인해 사용 안 함

        // 탭 상태 (기본값: 상점)
        const [tab, setTab] = useState("store"); 
        
        // 출석체크 관련 상태
        const [isChecked, setIsChecked] = useState(false);
        const [showStamp, setShowStamp] = useState(false);
        const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
        const [showDonate, setShowDonate] = useState(false);
        
        // 포인트 갱신 트리거
        const [refreshTrigger, setRefreshTrigger] = useState(0);

        // 포인트 갱신 함수
        const refreshAll = useCallback(() => {
            setRefreshTrigger(prev => prev + 1); 
        }, []);

        // 출석 상태 확인
        const checkAttendanceStatus = useCallback(async () => {
            if (!loginId) return;
            try {
                const resp = await axios.get("/point/main/attendance/status");
                setIsChecked(resp.data); 
            } catch(e) { console.error(e); }
        }, [loginId]);

        useEffect(() => {
            checkAttendanceStatus();
        }, [checkAttendanceStatus, refreshTrigger]);

        // 출석체크 실행 핸들러
        const handleAttendance = async () => {
            if (!loginId) return toast.error("로그인이 필요합니다.");
            try {
                const resp = await axios.post("/point/main/attendance/check");
                if (resp.data && String(resp.data).startsWith("success")) {
                    const point = resp.data.split(":")[1]?.trim() || "100";
                    
                    setShowStamp(true);
                    setIsChecked(true); 
                    setCalendarRefreshKey(prev => prev + 1); 
                    refreshAll(); 
                    
                    setTimeout(() => toast.success(`🎉 출석체크 완료! +${point}P`), 500);
                    setTimeout(() => setShowStamp(false), 3000);
                } else {
                    toast.warning(resp.data.includes(":") ? resp.data.split(":")[1] : resp.data); 
                }
            } catch (e) { toast.error("오류 발생"); }
        };
            
        return (
            <div className="movie-container">
                <ToastContainer position="top-center" autoClose={2000} theme="dark" />
                
                <div className="inner-wrapper">
                    
                    {/* 1. 상단 대시보드 */}
                    <div className="dashboard-row">
                        
                        {/* [왼쪽] 포인트 멤버십 카드 & 퀘스트 */}
                        <div className="dashboard-left">
                            <StoreProfile refreshTrigger={refreshTrigger} />
                            
                            <div className="mt-4">
                                <DailyQuest setTab={setTab} />
                            </div>
                            
                            <div className="text-end mt-2">
                                <button className="btn btn-outline-warning btn-sm" onClick={() => setShowDonate(true)}>
                                    🎁 포인트 선물하기
                                </button>
                            </div>
                        </div>

                        {/* [오른쪽] 통합 출석 패널 */}
                        <div className="dashboard-right">
                            <div className="attendance-unified-panel">
                                
                                {/* 헤더 */}
                                <div className="unified-header">
                                    <div className="header-left">
                                        <h2 className="header-title">📅 DAILY CHECK-IN</h2>
                                        <span className="header-subtitle">매일 출석하고 보상을 받아보세요!</span>
                                    </div>
                                    <div className="header-right">
                                        {isChecked && (
                                            <span className="attendance-status-text">✅ 완료</span>
                                        )}
                                        <button 
                                            className="attendance-btn" 
                                            onClick={handleAttendance} 
                                            disabled={isChecked}
                                        >
                                            {isChecked ? "내일 또 만나요" : "🎫 출석하기"}
                                        </button>
                                    </div>
                                </div>

                                {/* 달력 */}
                                <AttendanceCalendar refreshTrigger={calendarRefreshKey} />
                                
                                {/* 도장 애니메이션 */}
                                {showStamp && (
                                    <div className="small-stamp stamp-animation" style={{zIndex: 100}}>
                                        참잘<br/>했어요
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. 네비게이션 탭 */}
                    <ul className="nav-cinema">
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'store' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('store');}}>🍿 굿즈 스토어</a>
                        </li>
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'roulette' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('roulette');}}>🎰 룰렛 게임</a>
                        </li>
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'my_icon' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('my_icon');}}>🦸 마이 아이콘</a>
                        </li>
                        {/* ★ [추가] 랭킹 탭 생성 */}
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'ranking' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('ranking');}}>🏆 랭킹</a>
                        </li>
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'wish' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('wish');}}>💖 위시리스트</a>
                        </li>
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'inventory' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('inventory');}}>🎒 인벤토리</a>
                        </li>
                        <li className="nav-cinema-item">
                            <a href="#!" className={`nav-cinema-link ${tab === 'history' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setTab('history');}}>📜 기록</a>
                        </li>
                        {/* 관리자 탭 삭제됨 */}
                    </ul>

                    {/* 3. 콘텐츠 영역 */}
                    <div className="cinema-content">
                        {tab === "store" && <StoreView loginLevel={loginLevel} refreshPoint={refreshAll} />}
                        {tab === "roulette" && <Roulette refreshPoint={refreshAll} />}
                        {tab === "my_icon" && <MyIconView refreshPoint={refreshAll} />} 
                        
                        {/* ★ [추가] 랭킹 페이지 연결 */}
                        {tab === "ranking" && <PointRankingPage />}

                        {tab === "wish" && <WishlistView refreshPoint={refreshAll} />}
                        {tab === "inventory" && <InventoryView refreshPoint={refreshAll} />}
                        {tab === "history" && <HistoryView />}
                        
                        {/* 관리자 컴포넌트 삭제됨 */}
                    </div>

                    {/* 후원 모달 */}
                    {showDonate && <Donate closeModal={() => setShowDonate(false)} onSuccess={() => { refreshAll(); toast.success("후원 완료! 🎁"); }} />}
                </div>
            </div>
        );
    }