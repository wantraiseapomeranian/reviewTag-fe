import { useState } from "react";
import InventoryView from "./InventoryView";
import HistoryView from "./HistoryView";

export default function MyPointDashboard({ refreshPoint }) {
    const [subTab, setSubTab] = useState("inventory");

    return (
        <div className="point-dashboard">
            {/* 1. 서브 탭 메뉴 */}
            <ul className="nav nav-tabs nav-fill mb-0">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${subTab === 'inventory' ? 'active fw-bold text-dark' : 'text-secondary'}`} 
                        onClick={() => setSubTab('inventory')}
                    >
                        📦 아이템 보관함
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${subTab === 'history' ? 'active fw-bold text-dark' : 'text-secondary'}`} 
                        onClick={() => setSubTab('history')}
                    >
                        📜 포인트 내역
                    </button>
                </li>
            </ul>

            {/* 2. 내용 표시 영역 (흰색 배경 + 테두리로 깔끔하게) */}
            <div className="bg-white border border-top-0 rounded-bottom p-3 shadow-sm" style={{ minHeight: '400px' }}>
                
                {/* 탭 내용 전환 */}
                {subTab === "inventory" && (
                    <div className="fade-in">
                        <div className="alert alert-light border-0 py-2 mb-3">
                            <small className="text-muted">💡 구매한 아이템을 사용하거나 환불할 수 있습니다.</small>
                        </div>
                        {/* refreshPoint를 onRefund로 전달하여 아이템 사용/환불 시 상단 포인트 갱신 */}
                        <InventoryView onRefund={refreshPoint} />
                    </div>
                )}

                {subTab === "history" && (
                    <div className="fade-in">
                        {/* HistoryView는 자체적으로 데이터를 로드하므로 별도 props 필요 없음 */}
                        <HistoryView />
                    </div>
                )}
                
            </div>
        </div>
    );
}