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
import PointRankingPage from "./PointRanking";
import StoreProfile from "./StoreProfile";
// ★ [수정] 관리자 제거 -> 랭킹 페이지 추가
import IconListView from "./IconListView";

export default function PointMain() {
    const loginId = useAtomValue(loginIdState);
    const loginLevel = useAtomValue(loginLevelState);


    // 탭 상태 (기본값: store)
    const [tab, setTab] = useState("store");

    // 출석체크 및 갱신 상태
    const [isChecked, setIsChecked] = useState(false);
    const [showStamp, setShowStamp] = useState(false);
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
    const [showDonate, setShowDonate] = useState(false);

    // 포인트 갱신 트리거 (하위 컴포넌트들에서 포인트 변동 시 호출)
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // [함수] 전체 갱신 (프로필 포인트 정보 등)
    const refreshAll = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // [함수] 출석 상태 확인 (백엔드 연동)
    const checkAttendanceStatus = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/attendance/status");
            setIsChecked(resp.data);
        } catch (e) {
            console.error("출석 상태 확인 실패:", e);
        }
    }, [loginId]);

    useEffect(() => {
        checkAttendanceStatus();
    }, [checkAttendanceStatus, refreshTrigger]);

    // [함수] 출석체크 실행 핸들러
    const handleAttendance = async () => {
        if (!loginId) return toast.error("로그인이 필요합니다.");
        try {
            // 백엔드: addAttendancePoint(loginId, amount, "출석 체크 보상") 호출됨
            const resp = await axios.post("/point/main/attendance/check");

            if (resp.data && String(resp.data).startsWith("success")) {
                const point = resp.data.split(":")[1]?.trim() || "100";

                setShowStamp(true); // 도장 애니메이션
                setIsChecked(true);
                setCalendarRefreshKey(prev => prev + 1); // 달력 갱신
                refreshAll(); // 프로필 포인트 갱신

                setTimeout(() => toast.success(`🎉 출석 완료! +${point}P 가 적립되었습니다.`), 500);
                setTimeout(() => setShowStamp(false), 3000);
            } else {
                toast.warning(resp.data.includes(":") ? resp.data.split(":")[1] : resp.data);
            }
        } catch (e) {
            toast.error("출석 처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="movie-container">
            <ToastContainer position="top-center" autoClose={2000} theme="dark" />

            <div className="inner-wrapper">

                {/* 1. 상단 대시보드 (프로필 & 출석) */}
                <div className="dashboard-row">

                    {/* [좌측] 프로필 카드 & 일일 퀘스트 */}
                    <div className="dashboard-left">
                        {/* refreshTrigger를 전달하여 포인트 변동 시 프로필 실시간 갱신 */}
                        <StoreProfile refreshTrigger={refreshTrigger} />

                        <div className="mt-4">
                            {/* 퀘스트 완료 시에도 포인트를 갱신하도록 refreshPoint 전달 권장 */}
                            <DailyQuest setTab={setTab} refreshPoint={refreshAll} />
                        </div>

                        <div className="text-end mt-2">
                            <button className="btn btn-outline-warning btn-sm" onClick={() => setShowDonate(true)}>
                                🎁 포인트 선물하기
                            </button>
                        </div>
                    </div>

                    {/* [우측] 통합 출석 패널 */}
                    <div className="dashboard-right">
                        <div className="attendance-unified-panel">
                            <div className="unified-header">
                                <div className="header-left">
                                    <h2 className="header-title">📅 DAILY CHECK-IN</h2>
                                    <span className="header-subtitle">매일 접속하고 포인트를 쌓아보세요!</span>
                                </div>
                                <div className="header-right">
                                    {isChecked && <span className="attendance-status-text">✅ 오늘 출석 완료</span>}
                                    <button
                                        className="attendance-btn"
                                        onClick={handleAttendance}
                                        disabled={isChecked}
                                    >
                                        {isChecked ? "내일 다시 만나요" : "🎫 출석하기"}
                                    </button>
                                </div>
                            </div>

                            {/* 출석 달력 */}
                            <AttendanceCalendar refreshTrigger={calendarRefreshKey} />

                            {/* 도장 애니메이션 (참잘했어요) */}
                            {showStamp && (
                                <div className="small-stamp stamp-animation" style={{ zIndex: 100 }}>
                                    참잘<br />했어요
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. 네비게이션 탭 (시네마 스타일) */}
                <ul className="nav-cinema">
                    {[
                        { id: 'store', label: '🍿 굿즈 스토어' },
                        { id: 'roulette', label: '🎰 룰렛 게임' },
                        { id: 'my_icon', label: '🦸 마이 아이콘' },
                        { id: 'ranking', label: '🏆 랭킹' },
                        { id: 'wish', label: '💖 위시리스트' },
                        { id: 'inventory', label: '🎒 인벤토리' },
                        { id: 'history', label: '📜 기록' }
                    ].map(nav => (
                        <li className="nav-cinema-item" key={nav.id}>
                            <a
                                href="#!"
                                className={`nav-cinema-link ${tab === nav.id ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); setTab(nav.id); }}
                            >
                                {nav.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* 3. 콘텐츠 영역 */}
                <div className="cinema-content">
                    {tab === "store" && <StoreView loginLevel={loginLevel} refreshPoint={refreshAll} />}
                    {tab === "roulette" && <Roulette refreshPoint={refreshAll} />}
                    {tab === "my_icon" && <><MyIconView refreshPoint={refreshAll} /> <IconListView refreshPoint={refreshAll}></IconListView></>}
                    {tab === "ranking" && <PointRankingPage />}
                    {tab === "wish" && <WishlistView refreshPoint={refreshAll} />}
                    {tab === "inventory" && <InventoryView refreshPoint={refreshAll} />}
                    {tab === "history" && <HistoryView />}


                    {/* 후원 모달 */}
                    {showDonate && (
                        <Donate
                            closeModal={() => setShowDonate(false)}
                            onSuccess={() => { refreshAll(); toast.success("포인트 선물을 보냈습니다! 🎁"); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}