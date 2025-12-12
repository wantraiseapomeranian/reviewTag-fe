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
import IconAdmin from "./IconAdmin";
import MyIconView from "./MyIconView"; 

export default function PointMain() {
    const loginId = useAtomValue(loginIdState);
    const loginLevel = useAtomValue(loginLevelState);
    const isAdmin = loginLevel === "관리자";

    const [tab, setTab] = useState("store"); 
    
    // 내 정보 State
    const [myPoint, setMyPoint] = useState(0);
    const [myNickname, setMyNickname] = useState("");
    const [nickStyle, setNickStyle] = useState(""); 
    const [myIconSrc, setMyIconSrc] = useState(null); // 장착 아이콘 이미지
    
    const [isChecked, setIsChecked] = useState(false);
    const [showStamp, setShowStamp] = useState(false);
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
    const [showDonate, setShowDonate] = useState(false);

    // [1] 내 정보 로드 (서버에서 아이콘 경로 받아옴)
    const loadMyInfo = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/store/my-info");
            const data = resp.data || {}; 
            
            // ★ [디버깅용] 콘솔에서 이 로그를 확인해보세요!
            console.log("내 정보 로드 결과:", data);

            setMyPoint(data.point || 0);
            setMyNickname(data.nickname || loginId);
            setNickStyle(data.nickStyle || ""); 
            
            // 아이콘 경로 설정 (null이나 빈 문자열이면 null로 처리)
            setMyIconSrc(data.iconSrc && data.iconSrc.trim() !== "" ? data.iconSrc : null); 

        } catch (e) { console.error(e); }
    }, [loginId]);

    const checkAttendanceStatus = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/attendance/status");
            setIsChecked(resp.data); 
        } catch(e) { console.error(e); }
    }, [loginId]);

    useEffect(() => {
        loadMyInfo();
        checkAttendanceStatus();
    }, [loadMyInfo, checkAttendanceStatus]);

    // [2] 상단 아이콘 클릭 시 장착 해제 핸들러
    const handleHeaderUnequip = async () => {
        if (!myIconSrc) return; // 아이콘 없으면 무시
        
        if (!window.confirm("아이콘 장착을 해제하시겠습니까?")) return;

        try {
            await axios.post("/point/icon/unequip");
            toast.info("장착이 해제되었습니다.");
            setMyIconSrc(null); // 즉시 화면에서 제거
            
            // 만약 현재 탭이 '내 아이콘'이라면 목록도 갱신해주면 좋음
            // (여기선 loadMyInfo만 다시 호출)
            loadMyInfo();
        } catch (e) {
            toast.error("해제 실패");
        }
    };

    // 출석체크 핸들러
    const handleAttendance = async () => {
        if (!loginId) return toast.error("로그인이 필요합니다.");
        try {
            const resp = await axios.post("/point/main/attendance/check");
            if (resp.data && String(resp.data).startsWith("success")) {
                const point = resp.data.split(":")[1]?.trim() || "100";
                setShowStamp(true);
                setIsChecked(true); 
                loadMyInfo();
                setCalendarRefreshKey(prev => prev + 1); 
                setTimeout(() => toast.success(`🎉 출석체크 완료! +${point}P`), 500);
                setTimeout(() => setShowStamp(false), 3000);
            } else {
                toast.warning(resp.data.includes(":") ? resp.data.split(":")[1] : resp.data); 
            }
        } catch (e) { toast.error("오류 발생"); }
    };

    return (
        <div className="container py-4" style={{maxWidth: '800px'}}>
            <ToastContainer position="top-center" autoClose={2000} theme="light" />

            {/* 1. 상단 정보 (헤더) */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h4 className="fw-bold mb-0 text-secondary">Point Lounge</h4>
                
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="fs-5 d-flex align-items-center justify-content-end">
                            
                            {/* ★ [수정] 장착 아이콘 표시 & 해제 기능 추가 */}
                            {myIconSrc ? (
                                <div className="position-relative d-inline-block me-2" 
                                     style={{cursor: 'pointer'}}
                                     onClick={handleHeaderUnequip} 
                                     title="클릭하여 장착 해제">
                                    <img 
                                        src={myIconSrc} 
                                        alt="my-icon" 
                                        className="rounded-circle border border-2 border-warning shadow-sm"
                                        style={{
                                            width: '42px', 
                                            height: '42px', 
                                            objectFit: 'cover', 
                                            backgroundColor: '#fff'
                                        }} 
                                        onError={(e) => {
                                            console.log("이미지 로드 실패:", myIconSrc);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    {/* 마우스 올렸을 때 'x' 표시 같은 효과를 주려면 CSS 추가 필요 (선택사항) */}
                                </div>
                            ) : null}

                            {/* 닉네임 */}
                            <span className={nickStyle ? nickStyle : "fw-bold text-dark"}>
                                {myNickname}
                            </span>
                            <span className="text-dark ms-1">님</span> 
                            <span className="badge bg-secondary ms-1 fs-6">{loginLevel}</span>
                        </div>
                        <small className="text-muted">오늘도 환영합니다!</small>
                    </div>

                    <div className="d-flex flex-column align-items-end gap-1">
                        <div className="bg-light px-4 py-2 rounded-pill border shadow-sm text-center">
                            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>MY POINT</small>
                            <strong className="text-primary fs-5">{(myPoint || 0).toLocaleString()} P</strong>
                        </div>
                        <button className="btn btn-sm btn-outline-warning rounded-pill fw-bold" onClick={() => setShowDonate(true)}>
                            🎁 선물하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. 출석 배너 */}
            <div className={`card shadow-sm border-0 mb-4 attendance-card ${isChecked ? "checked" : "unchecked"}`}>
                <div className="card-body p-4 text-center">
                    {(showStamp || isChecked) && <div className={`attendance-stamp ${showStamp ? 'stamp-animation' : ''}`}>COMPLETED</div>}
                    <h3 className="fw-bold mb-2">{isChecked ? "✅ 오늘 출석 완료!" : "📅 매일매일 출석체크"}</h3>
                    <button className={`btn btn-lg px-5 rounded-pill fw-bold ${isChecked ? "btn-secondary" : "btn-primary"}`} onClick={handleAttendance} disabled={isChecked}>
                        {isChecked ? "참여 완료" : "출석하고 포인트 받기"}
                    </button>
                </div>
            </div>

            {/* 3. 달력 */}
            <div className="mb-5"><AttendanceCalendar refreshTrigger={calendarRefreshKey} /></div>

            {/* 4. 탭 메뉴 */}
            <ul className="nav nav-tabs nav-fill mb-0">
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'store' ? 'active fw-bold' : ''}`} onClick={() => setTab('store')}>🛒 상점</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'roulette' ? 'active fw-bold text-danger' : ''}`} onClick={() => setTab('roulette')}>🎰 룰렛</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'my_icon' ? 'active fw-bold text-primary' : ''}`} onClick={() => setTab('my_icon')}>🦸 내 아이콘</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'wish' ? 'active fw-bold' : ''}`} onClick={() => setTab('wish')}>💖 찜</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'inventory' ? 'active fw-bold' : ''}`} onClick={() => setTab('inventory')}>🎒 보관함</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${tab === 'history' ? 'active fw-bold' : ''}`} onClick={() => setTab('history')}>📜 내역</button>
                </li>
                {isAdmin && (
                    <li className="nav-item">
                        <button className={`nav-link text-danger ${tab === 'admin' ? 'active fw-bold' : ''}`} onClick={() => setTab('admin')}>⚙️ 관리자</button>
                    </li>
                )}
            </ul>

            {/* 5. 탭 컨텐츠 */}
            <div className="tab-content-area border border-top-0 p-3 rounded-bottom bg-white shadow-sm">
                {tab === "store" && <StoreView loginLevel={loginLevel} refreshPoint={loadMyInfo} />}
                {tab === "roulette" && <Roulette refreshPoint={loadMyInfo} />}
                {tab === "my_icon" && <MyIconView refreshPoint={loadMyInfo} />} 
                {tab === "wish" && <WishlistView refreshPoint={loadMyInfo} />}
                {tab === "inventory" && <InventoryView refreshPoint={loadMyInfo} />}
                {tab === "history" && <HistoryView />}
                {isAdmin && tab === "admin" && <IconAdmin />}
            </div>

            {/* 6. 후원 모달 */}
            {showDonate && <Donate closeModal={() => setShowDonate(false)} onSuccess={() => { loadMyInfo(); toast.success("후원 완료! 🎁"); }} />}
        </div>
    );
}