import { useEffect, useState, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { loginIdState, loginLevelState } from "../../utils/jotai";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PointMain.css";

// 하위 컴포넌트 임포트
import AttendanceCalendar from "./AttendanceCalendar";
import StoreView from "./StoreView";
import InventoryView from "./InventoryView";
import HistoryView from "./HistoryView";
import WishlistView from "./WishlistView";
import Donate from "./Donate";
import Roulette from "./Roulette";
import MyIconView from "./MyIconView";
import DailyQuest from "./DailyQuest";
import PointRankingPage from "./PointRanking";
import StoreProfile from "./StoreProfile";
import IconListView from "./IconListView";

export default function PointMain() {
    const loginId = useAtomValue(loginIdState); // Jotai를 통한 로그인 상태 확인
    const loginLevel = useAtomValue(loginLevelState);

    const [tab, setTab] = useState("store");
    const [isChecked, setIsChecked] = useState(false);
    const [showStamp, setShowStamp] = useState(false);
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
    const [showDonate, setShowDonate] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // [로직 반영] 로그인 여부에 따른 탭 구성 (비로그인: 3개, 로그인: 7개)
    const navItems = useMemo(() => {
        const publicTabs = [
            { id: 'store', label: '🍿 굿즈 스토어' },
            { id: 'roulette', label: '🎰 룰렛 게임' },
            { id: 'ranking', label: '🏆 랭킹' }
        ];

        if (loginId) {
            return [
                ...publicTabs,
                { id: 'my_icon', label: '🦸 마이 아이콘' },
                { id: 'wish', label: '💖 위시리스트' },
                { id: 'inventory', label: '🎒 인벤토리' },
                { id: 'history', label: '📜 기록' }
            ];
        }
        return publicTabs;
    }, [loginId]);

    const refreshAll = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // 서버와의 출석 상태 연동 (MyBatis/Oracle)
    const checkAttendanceStatus = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/attendance/status");
            setIsChecked(resp.data);
        } catch (e) {
            console.error("출석 확인 실패:", e);
        }
    }, [loginId]);

    useEffect(() => {
        checkAttendanceStatus();
    }, [checkAttendanceStatus, refreshTrigger]);

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
                setTimeout(() => toast.success(`🎉 출석 완료! +${point}P`), 500);
                setTimeout(() => setShowStamp(false), 3000);
            }
        } catch (e) {
            toast.error("출석 처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="movie-container">
            <ToastContainer position="top-center" autoClose={2000} theme="dark" />

            <div className="inner-wrapper">
                {/* 1. 상단 대시보드 */}
                <div className="dashboard-row">
                    <div className="dashboard-left">
                        <StoreProfile refreshTrigger={refreshTrigger} />
                        <div className="mt-4">
                            <DailyQuest setTab={setTab} refreshPoint={refreshAll} />
                        </div>
                        {loginId && (
                            <div className="text-end mt-2">
                                <button className="btn-gift-neon-small" onClick={() => setShowDonate(true)}>
                                    🎁 포인트 선물하기
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-right">
                        {/* 화이트 테마 및 테두리가 적용된 출석 패널 */}
                        <div className="attendance-unified-panel">
                            <div className="unified-header">
                                <div className="header-left">
                                    <h2 className="header-title">📅 DAILY CHECK-IN</h2>
                                    <span className="header-subtitle">매일 접속하고 도장을 찍어보세요!</span>
                                </div>
                                
                                <div className="header-right">
                                    {isChecked ? (
                                        <div className="attendance-complete-badge">
                                            <span className="badge-icon">✔</span>
                                            <div className="badge-text">
                                                <div className="main">오늘 출석 완료</div>
                                                <div className="sub">내일 다시 만나요</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            className="attendance-btn-neon" 
                                            onClick={handleAttendance}
                                            disabled={!loginId}
                                        >
                                            {loginId ? "🎫 지금 출석하기" : "로그인 필요"}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <AttendanceCalendar refreshTrigger={calendarRefreshKey} />
                            
                            {showStamp && <div className="small-stamp stamp-animation">참잘<br/>했어요</div>}
                        </div>
                    </div>
                </div>

                {/* 2. 네비게이션 탭 */}
                <ul className="nav-cinema">
                    {navItems.map(nav => (
                        <li className="nav-cinema-item" key={nav.id}>
                            <button
                                className={`nav-cinema-link ${tab === nav.id ? 'active' : ''}`}
                                onClick={() => setTab(nav.id)}
                            >
                                {nav.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* 3. 콘텐츠 영역 */}
                <div className="cinema-content">
                    {tab === "store" && <StoreView loginLevel={loginLevel} refreshPoint={refreshAll} />}
                    {tab === "roulette" && <Roulette refreshPoint={refreshAll} />}
                    {tab === "ranking" && <PointRankingPage />}
                    {loginId && (
                        <>
                            {tab === "my_icon" && <><MyIconView refreshPoint={refreshAll} /><IconListView refreshPoint={refreshAll}/></>}
                            {tab === "wish" && <WishlistView refreshPoint={refreshAll} />}
                            {tab === "inventory" && <InventoryView refreshPoint={refreshAll} />}
                            {tab === "history" && <HistoryView />}
                        </>
                    )}
                </div>

                {showDonate && (
                    <Donate closeModal={() => setShowDonate(false)} onSuccess={refreshAll} />
                )}
            </div>
        </div>
    );
}