import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import moment from "moment";

export default function HistoryView() {
    const loginId = useAtomValue(loginIdState);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 탭 상태 관리 (ALL: 전체, GAIN: 획득, SPEND: 포인트사용, ITEM: 아이템사용)
    const [filterType, setFilterType] = useState("ALL");

    // 내역 데이터 로드
    const loadHistory = useCallback(async () => {
        if (!loginId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const resp = await axios.get("/point/history");
            setHistory(resp.data);
        } catch (e) {
            console.error("포인트 내역 로드 실패:", e);
            alert("포인트 내역을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [loginId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // ⭐ 필터링 로직 (useMemo로 성능 최적화)
    const filteredHistory = useMemo(() => {
        if (filterType === "ALL") return history;

        return history.filter(item => {
            const amt = item.pointHistoryAmount;
            
            if (filterType === "GAIN") {
                // 획득: 양수(+)
                return amt > 0;
            } 
            else if (filterType === "SPEND") {
                // 포인트 사용: 음수(-) (구매, 선물 등)
                return amt < 0;
            } 
            else if (filterType === "ITEM") {
                // 아이템 사용: 변동 없음(0) 이거나, 사유에 '사용'이 포함된 경우
                // (보통 인벤토리 사용은 포인트 변동이 0입니다)
                return amt === 0;
            }
            return true;
        });
    }, [history, filterType]);

    // 탭 버튼 클릭 핸들러
    const getTabClass = (type) => {
        return `btn btn-sm ${filterType === type ? "btn-dark active" : "btn-outline-secondary"}`;
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-muted fw-bold mb-0">
                    {filterType === "ALL" && "전체 내역"}
                    {filterType === "GAIN" && "포인트 획득 내역"}
                    {filterType === "SPEND" && "포인트 사용 내역"}
                    {filterType === "ITEM" && "아이템 사용 기록"}
                    <span className="ms-2 small text-muted">({filteredHistory.length}건)</span>
                </h5>

                {/* ⭐ 탭 버튼 그룹 */}
                <div className="btn-group" role="group">
                    <button type="button" className={getTabClass("ALL")} onClick={() => setFilterType("ALL")}>전체</button>
                    <button type="button" className={getTabClass("GAIN")} onClick={() => setFilterType("GAIN")}>획득 (+)</button>
                    <button type="button" className={getTabClass("SPEND")} onClick={() => setFilterType("SPEND")}>사용 (-)</button>
                    <button type="button" className={getTabClass("ITEM")} onClick={() => setFilterType("ITEM")}>아이템 사용</button>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="alert alert-light border text-center mt-4 py-5">
                    <h5 className="text-secondary">📜 해당 내역이 없습니다.</h5>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle shadow-sm">
                        <thead className="table-primary">
                            <tr>
                                <th scope="col" style={{ width: '10%' }}>#</th>
                                <th scope="col" style={{ width: '20%' }}>거래 일시</th>
                                <th scope="col" style={{ width: '50%' }}>내용 (사유)</th>
                                <th scope="col" className="text-end" style={{ width: '20%' }}>포인트 변화</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((record, index) => {
                                const isGain = record.pointHistoryAmount > 0;
                                const isZero = record.pointHistoryAmount === 0;
                                
                                // 색상 처리: 획득(초록), 사용(빨강), 0(회색)
                                let amountClass = "fw-bold text-secondary";
                                let sign = "";
                                if (isGain) {
                                    amountClass = "text-success fw-bold";
                                    sign = "+";
                                } else if (!isZero) {
                                    amountClass = "text-danger fw-bold";
                                    sign = "-";
                                }

                                const displayAmount = Math.abs(record.pointHistoryAmount).toLocaleString();

                                return (
                                    <tr key={record.pointHistoryNo}>
                                        <td>{index + 1}</td>
                                        <td>{moment(record.pointHistoryTime).format('YY.MM.DD HH:mm')}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {/* 아이콘/뱃지로 구분감 주기 */}
                                                {isGain && <span className="badge bg-success bg-opacity-10 text-success me-2 border border-success border-opacity-25">획득</span>}
                                                {record.pointHistoryAmount < 0 && <span className="badge bg-danger bg-opacity-10 text-danger me-2 border border-danger border-opacity-25">구매/지출</span>}
                                                {isZero && <span className="badge bg-secondary bg-opacity-10 text-secondary me-2 border border-secondary border-opacity-25">Log</span>}
                                                
                                                <span className="text-truncate">{record.pointHistoryReason}</span>
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            <span className={amountClass}>
                                                {sign} {displayAmount} P
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}