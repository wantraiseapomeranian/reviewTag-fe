import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function HistoryView() {
    const [history, setHistory] = useState([]);

    // 내역 불러오기
    const loadHistory = useCallback(async () => {
        try {
            // ★ 수정된 깔끔한 주소 사용
            const resp = await axios.get("/point/history");
            setHistory(resp.data);
        } catch (e) {
            console.error("내역 로드 실패:", e);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return (
        <div className="row">
            <div className="col-12">
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">📜 포인트 이용 내역</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{width: "25%"}}>날짜</th>
                                        <th style={{width: "50%"}}>내용</th>
                                        <th style={{width: "25%"}}>변동액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="p-5 text-muted">
                                                아직 포인트 내역이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((h) => (
                                            <tr key={h.pointHistoryNo}>
                                                {/* 날짜/시간 */}
                                                <td className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                    <div>{new Date(h.pointHistoryDate).toLocaleDateString()}</div>
                                                    <small>{new Date(h.pointHistoryDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                                </td>
                                                
                                                {/* 사유 (왼쪽 정렬) */}
                                                <td className="text-start ps-4">
                                                    {h.pointHistoryReason}
                                                </td>
                                                
                                                {/* 금액 (양수:파랑, 음수:빨강) */}
                                                <td className={`fw-bold ${h.pointHistoryAmount > 0 ? 'text-primary' : 'text-danger'}`}>
                                                    {h.pointHistoryAmount > 0 ? '+' : ''}
                                                    {h.pointHistoryAmount.toLocaleString()} P
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}