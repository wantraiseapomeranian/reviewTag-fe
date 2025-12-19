import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./HistoryView.css"; 

export default function HistoryView() {
    const [historyList, setHistoryList] = useState([]);
    
    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // 필터 상태
    const [filterType, setFilterType] = useState("all"); 

    // [1] 데이터 로드 (백엔드 경로 /point/main/history 권장)
    const loadHistory = useCallback(async () => {
        try {
            // 백엔드에서 페이징 목록 조회를 담당하는 주소로 변경
            const resp = await axios.get(`/point/history?page=${page}&type=${filterType}`);
            const data = resp.data;
            
            setHistoryList(data.list || []); // 데이터가 없을 경우 빈 배열 세팅
            setTotalPage(data.totalPage || 0);
            
            // 만약 백엔드 VO에 totalCount가 없다면 list.length 등으로 대체 가능하나, 
            // 정확한 개수를 위해 서버에서 넘겨주는 값을 권장합니다.
            setTotalCount(data.totalCount || data.list?.length || 0); 
        } catch (e) {
            console.error("포인트 내역 로드 중 오류 발생:", e);
        }
    }, [page, filterType]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // 필터 변경
    const handleFilterChange = (type) => {
        setFilterType(type);
        setPage(1); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (totalPage === 0 || newPage <= totalPage)) {
            setPage(newPage);
        }
    };

    // [2] 사유(Reason) 출력 로직 (가장 중요!)
    const getHistoryDescription = (item) => {
        // 1순위: 백엔드에서 보낸 구체적인 사유(Reason)
        if (item.pointHistoryReason) return item.pointHistoryReason;

        // 2순위: 사유가 없을 경우 trxType을 기반으로 한 한글 변환(Fallback)
        const type = item.pointHistoryTrxType;
        const amt = item.pointHistoryAmount;

        switch(type) {
            case "USE": return "아이템 구매/사용";
            case "GET": return amt > 0 ? "포인트 적립" : "포인트 변동";
            case "SEND": return "포인트 선물 보냄";
            case "RECEIVED": return "포인트 선물 받음";
            default: return amt > 0 ? "포인트 획득" : "포인트 사용";
        }
    };

    // 날짜 및 시간 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };
    
    // 페이지네이션 렌더링
    const renderPagination = () => {
        if (totalPage <= 1) return null;
        const pageGroupSize = 5; 
        const currentGroup = Math.ceil(page / pageGroupSize); 
        const startPage = (currentGroup - 1) * pageGroupSize + 1;
        const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="glass-pagination">
                <button 
                    className="glass-page-btn arrow" 
                    onClick={() => handlePageChange(startPage - 1)} 
                    disabled={startPage === 1}
                > &lt; </button>
                {pages.map(p => (
                    <button 
                        key={p} 
                        className={`glass-page-btn ${p === page ? 'active' : ''}`} 
                        onClick={() => handlePageChange(p)}
                    > {p} </button>
                ))}
                <button 
                    className="glass-page-btn arrow" 
                    onClick={() => handlePageChange(endPage + 1)} 
                    disabled={endPage === totalPage}
                > &gt; </button>
            </div>
        );
    };

    return (
        <div className="history-glass-wrapper">
            
            {/* 1. 상단 헤더 & 필터 */}
            <div className="history-header-glass">
                <div className="header-title-box">
                    <h4 className="title-glass">📜 Transaction Log</h4>
                    <span className="total-cnt-glass">Total: {totalCount} records</span>
                </div>
                
                <div className="glass-filter-group">
                    {[
                        { id: 'all', label: '전체' },
                        { id: 'earn', label: '획득 (+)' },
                        { id: 'use', label: '사용 (-)' },
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

            {/* 2. 리스트 컨테이너 */}
            <div className="history-list-frame">
                <div className="list-header-row">
                    <span className="col-w-date">DATE</span>
                    <span className="col-w-type">TYPE</span>
                    <span className="col-w-desc">DESCRIPTION</span>
                    <span className="col-w-amount">AMOUNT</span>
                </div>

                <div className="list-body-scroll">
                    {historyList.length === 0 ? (
                        <div className="empty-history">
                            <div className="empty-icon">📁</div>
                            <span>포인트 내역이 없습니다.</span>
                        </div>
                    ) : (
                        historyList.map((item) => {
                            // 금액이 0보다 크거나 trxType이 GET이면 획득으로 간주
                            const isPositive = item.pointHistoryAmount > 0;
                            const isZero = item.pointHistoryAmount === 0;
                            const amountClass = isZero ? "amt-zero" : (isPositive ? "amt-plus" : "amt-minus");

                            return (
                                <div className="history-row" key={item.pointHistoryId}>
                                    {/* 날짜/시간 (pointHistoryCreatedAt 반영) */}
                                    <div className="col-w-date">
                                        <div className="row-date">{formatDate(item.pointHistoryCreatedAt)}</div>
                                        <div className="row-time">{formatTime(item.pointHistoryCreatedAt)}</div>
                                    </div>

                                    {/* 타입 뱃지 */}
                                    <div className="col-w-type">
                                        <span className={`type-badge ${isZero ? 'type-item' : (isPositive ? 'type-earn' : 'type-use')}`}>
                                            {item.pointHistoryTrxType}
                                        </span>
                                    </div>

                                    {/* 상세 설명 (pointHistoryReason 반영) */}
                                    <div className="col-w-desc">
                                        {getHistoryDescription(item)}
                                    </div>

                                    {/* 금액 (포맷팅) */}
                                    <div className={`col-w-amount ${amountClass}`}>
                                        {isPositive ? '+' : ''}{item.pointHistoryAmount.toLocaleString()} P
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 3. 페이지네이션 */}
            {renderPagination()}
        </div>
    );
}