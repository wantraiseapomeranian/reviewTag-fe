import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./PointMain.css"; 

export default function HistoryView() {
    const [historyList, setHistoryList] = useState([]);
    
    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // ★ [추가] 필터 상태 (all, earn, use, item)
    const [filterType, setFilterType] = useState("all"); 

    // 데이터 로드
    const loadHistory = useCallback(async () => {
        try {
            // ★ [수정] type 파라미터 추가
            const resp = await axios.get(`/point/history?page=${page}&type=${filterType}`);
            const data = resp.data;
            
            setHistoryList(data.list);
            setTotalPage(data.totalPage);
            setTotalCount(data.totalCount);
        } catch (e) {
            console.error(e);
        }
    }, [page, filterType]); // ★ filterType이 바뀌어도 실행되어야 함

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // ★ [추가] 필터 변경 핸들러 (필터 바꾸면 1페이지로 초기화)
    const handleFilterChange = (type) => {
        setFilterType(type);
        setPage(1); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPage) {
            setPage(newPage);
        }
    };

    // 페이지네이션 렌더링 함수 (기존과 동일)
    const renderPagination = () => {
        if (totalPage === 0) return null;
        const pageGroupSize = 10;
        const currentGroup = Math.ceil(page / pageGroupSize); 
        const startPage = (currentGroup - 1) * pageGroupSize + 1;
        const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                <button className="btn btn-sm btn-light border" onClick={() => handlePageChange(startPage - 1)} disabled={startPage === 1}>&lt;</button>
                {pages.map(p => (
                    <button key={p} className={`btn btn-sm fw-bold ${p === page ? 'btn-primary' : 'btn-light border'}`} onClick={() => handlePageChange(p)} style={{width: '32px'}}>{p}</button>
                ))}
                <button className="btn btn-sm btn-light border" onClick={() => handlePageChange(endPage + 1)} disabled={endPage === totalPage}>&gt;</button>
            </div>
        );
    };

    return (
        <div className="history-container">
            
            {/* 상단 헤더 및 필터 영역 */}
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <h5 className="fw-bold mb-2">이용 내역</h5>
                    <span className="text-muted small">총 {totalCount}건의 내역이 있습니다.</span>
                </div>
                
                {/* ★ [추가] 필터 버튼 그룹 */}
                <div className="btn-group shadow-sm" role="group">
                    <button 
                        type="button" 
                        className={`btn btn-sm ${filterType === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        전체
                    </button>
                    <button 
                        type="button" 
                        className={`btn btn-sm ${filterType === 'earn' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => handleFilterChange('earn')}
                    >
                        획득 (+)
                    </button>
                    <button 
                        type="button" 
                        className={`btn btn-sm ${filterType === 'use' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => handleFilterChange('use')}
                    >
                        사용 (-)
                    </button>
                    <button 
                        type="button" 
                        className={`btn btn-sm ${filterType === 'item' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handleFilterChange('item')}
                    >
                        아이템
                    </button>
                </div>
            </div>

            {/* 테이블 영역 */}
            <div className="table-responsive bg-white rounded shadow-sm">
                <table className="table table-hover align-middle mb-0 text-center">
                    <thead className="bg-light">
                        <tr>
                            <th width="10%">#</th>
                            <th width="20%">날짜</th>
                            <th width="50%" className="text-start">내용</th>
                            <th width="20%">포인트</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyList.length === 0 ? (
                            <tr><td colSpan="4" className="py-5 text-muted">해당 내역이 없습니다.</td></tr>
                        ) : (
                            historyList.map((item, index) => (
                                <tr key={item.pointHistoryNo}>
                                    <td className="text-muted text-small">
                                        {totalCount - ((page - 1) * 10 + index)}
                                    </td>
                                    <td className="text-muted small">
                                        {new Date(item.pointHistoryDate).toLocaleDateString()}
                                    </td>
                                    <td className="text-start">
                                        <span className={`badge me-2 ${
                                            item.pointHistoryAmount > 0 ? 'bg-success-subtle text-success' : 
                                            item.pointHistoryAmount < 0 ? 'bg-danger-subtle text-danger' : 
                                            'bg-primary-subtle text-primary'
                                        }`}>
                                            {item.pointHistoryAmount > 0 ? '획득' : item.pointHistoryAmount < 0 ? '사용' : '기록'}
                                        </span>
                                        {item.pointHistoryReason}
                                    </td>
                                    <td className={`fw-bold ${
                                        item.pointHistoryAmount > 0 ? 'text-success' : 
                                        item.pointHistoryAmount < 0 ? 'text-danger' : 'text-secondary'
                                    }`}>
                                        {item.pointHistoryAmount > 0 ? '+' : ''}
                                        {item.pointHistoryAmount.toLocaleString()} P
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 렌더링 */}
            {renderPagination()}
        </div>
    );
}