import { useState } from "react";
import InventoryView from "./InventoryView";
import HistoryView from "./HistoryView";

export default function MyPointDashboard({ refreshPoint }) {
    const [subTab, setSubTab] = useState("inventory");

    return (
        <div>
            {/* 서브 탭 (보관함 vs 내역) */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${subTab === 'inventory' ? 'active' : ''}`} 
                        onClick={() => setSubTab('inventory')}
                    >
                        📦 아이템 보관함
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${subTab === 'history' ? 'active' : ''}`} 
                        onClick={() => setSubTab('history')}
                    >
                        📜 포인트 사용 내역
                    </button>
                </li>
            </ul>

            {/* 내용 표시 */}
            {subTab === "inventory" && <InventoryView onRefund={refreshPoint} />}
            {subTab === "history" && <HistoryView />}
        </div>
    );
}