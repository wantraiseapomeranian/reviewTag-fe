import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaHistory, FaFilter, FaInbox } from "react-icons/fa"; // 아이콘 라이브러리 권장
import "./HistoryView.css"; 

export default function HistoryView() {
    const [historyList, setHistoryList] = useState([]);
    
    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // 필터 상태 (all, earn, use)
    const [filterType, setFilterType] = useState("all"); 

    // [1] 데이터 로드 로직
    const loadHistory = useCallback(async () => {
        try {
            // 백엔드: PointRestController의 @GetMapping("/history") 호출
            const resp = await axios.get("/point/history", {
                params: {
                    page: page,
                    type: filterType
                }
            });
            const data = resp.data;
            
            setHistoryList(data.list || []); 
            setTotalPage(data.totalPage || 0);
            setTotalCount(data.totalCount || 0); 
        } catch (e) {
            console.error("포인트 내역 로드 중 오류 발생:", e);
        }
    }, [page, filterType]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // [2] 필터 및 페이지 변경 핸들러
    const handleFilterChange = (type) => {
        setFilterType(type);
        setPage(1); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (totalPage === 0 || newPage <= totalPage)) {
            setPage(newPage);
        }
    };

    // [3] 상세 설명 출력 로직 (Reason 필드 활용)
    const getHistoryDescription = (item) => {
        if (item.pointHistoryReason) return item.pointHistoryReason;

        const type = item.pointHistoryTrxType;
        const amt = item.pointHistoryAmount;

        switch(type) {
            case "USE": return "아이템 구매 또는 서비스 이용";
            case "GET": return amt > 0 ? "이벤트 또는 퀘스트 보상" : "포인트 변동";
            case "SEND": return "다른 회원에게 포인트 선물";
            case "RECEIVED": return "회원님에게 도착한 포인트 선물";
            default: return "시스템 포인트 조정";
        }
    };

    // 날짜 포맷 (MM.DD)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    };

    // 시간 포맷 (HH:mm)
    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };
    
    // [4] 페이지네이션 버튼 렌더링
    const renderPagination = () => {
        if (totalPage <= 1) return null;
        
        const pages = [];
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPage, startPage + 4);
        
        if (endPage === totalPage) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button 
                    key={i} 
                    className={`glass-page-btn ${i === page ? 'active' : ''}`} 
                    onClick={() => handlePageChange(i)}
                > {i} </button>
            );
        }

        return (
            <div className="glass-pagination mt-4">
                <button className="glass-page-btn arrow" onClick={() => handlePageChange(1)} disabled={page === 1}>&laquo;</button>
                {pages}
                <button className="glass-page-btn arrow" onClick={() => handlePageChange(totalPage)} disabled={page === totalPage}>&raquo;</button>
            </div>
        );
    };

    return (
        <div className="history-glass-wrapper animate__animated animate__fadeIn">
            
            {/* 상단 헤더 섹션 */}
            <div className="history-header-glass">
                <div className="header-title-box">
                    <h4 className="title-glass"><FaHistory className="me-2"/>Transaction Log</h4>
                    <span className="total-cnt-glass">총 {totalCount.toLocaleString()}건의 내역</span>
                </div>
                
                {/* 필터 탭 */}
                <div className="glass-filter-group">
                    {[
                        { id: 'all', label: '전체' },
                        { id: 'earn', label: '적립' },
                        { id: 'use', label: '사용' },
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            className={`glass-filter-btn ${filterType === btn.id ? 'active' : ''}`}
                            onClick={() => handleFilterChange(btn.id)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 리스트 본문 */}
            <div className="history-list-frame">
                <div className="list-header-row">
                    <span className="col-w-date">일시</span>
                    <span className="col-w-type">유형</span>
                    <span className="col-w-desc">상세 내용</span>
                    <span className="col-w-amount">변동 금액</span>
                </div>

                <div className="list-body-scroll">
                    {historyList.length === 0 ? (
                        <div className="empty-history">
                            <FaInbox className="empty-icon" />
                            <span>표시할 포인트 내역이 없습니다.</span>
                        </div>
                    ) : (
                        historyList.map((item) => {
                            const isPositive = item.pointHistoryAmount > 0;
                            const isZero = item.pointHistoryAmount === 0;
                            const amountClass = isZero ? "amt-zero" : (isPositive ? "amt-plus" : "amt-minus");

                            return (
                                <div className="history-row" key={item.pointHistoryId}>
                                    {/* 날짜/시간 */}
                                    <div className="col-w-date">
                                        <div className="row-date">{formatDate(item.pointHistoryCreatedAt)}</div>
                                        <div className="row-time text-secondary">{formatTime(item.pointHistoryCreatedAt)}</div>
                                    </div>

                                    {/* 유형 뱃지 */}
                                    <div className="col-w-type">
                                        <span className={`type-badge-glass ${item.pointHistoryTrxType.toLowerCase()}`}>
                                            {item.pointHistoryTrxType}
                                        </span>
                                    </div>

                                    {/* 상세 사유 */}
                                    <div className="col-w-desc" title={getHistoryDescription(item)}>
                                        {getHistoryDescription(item)}
                                    </div>

                                    {/* 포인트 수치 */}
                                    <div className={`col-w-amount ${amountClass}`}>
                                        <span className="amt-text">
                                            {isPositive ? '+' : ''}{item.pointHistoryAmount.toLocaleString()}
                                        </span>
                                        <span className="amt-unit">P</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 페이지네이션 */}
            {renderPagination()}
        </div>
    );
}