import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Admin from "../guard/Admin";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminInventory.css";

export default function AdminInventory() {
    const [searchId, setSearchId] = useState("");
    const [viewTab, setViewTab] = useState("item"); 
    const [grantTab, setGrantTab] = useState("item");
    const [inventoryList, setInventoryList] = useState([]);
    const [iconList, setIconList] = useState([]);
    const [storeItems, setStoreItems] = useState([]);
    const [masterIcons, setMasterIcons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [resItems, resIcons] = await Promise.all([
                    axios.get("/admin/inventory/item-list"),
                    axios.get("/admin/icon/list")
                ]);
                setStoreItems(resItems.data || []);
                setMasterIcons(resIcons.data || []);
            } catch (err) {
                toast.error("시스템 아이콘/아이템 목록을 불러오지 못했습니다.");
            }
        };
        loadMasterData();
    }, []);

    useEffect(() => {
        setInventoryList([]);
        setIconList([]);
    }, [searchId]);

    const fetchUserData = useCallback(async () => {
        if (!searchId.trim()) return toast.warning("ID를 입력하세요.");
        setLoading(true);
        try {
            const [resInv, resIcon] = await Promise.all([
                axios.get(`/admin/inventory/${searchId}`),
                axios.get(`/admin/icon/${searchId}`)
            ]);
            setInventoryList(resInv.data || []);
            setIconList(resIcon.data || []);
            toast.info("자산 정보를 동기화했습니다.");
        } catch (err) {
            Swal.fire({
                title: "조회 실패",
                text: "존재하지 않는 유저이거나 서버 오류입니다.",
                icon: "error",
                didOpen: () => (Swal.getContainer().style.zIndex = "3000") // 최상단 유지
            });
        } finally { setLoading(false); }
    }, [searchId]);

    const handleRecall = async (type, no, name) => {
        const result = await Swal.fire({
            title: '⚠️ 자산 강제 회수',
            text: `[${name}]을(를) 회수하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            background: '#1a1a1a', color: '#fff',
            didOpen: () => (Swal.getContainer().style.zIndex = "3000") // 최상단 유지
        });

        if (result.isConfirmed) {
            try {
                const url = type === "item" ? `/admin/inventory/${no}` : `/admin/icon/${no}`;
                await axios.delete(url);
                if (type === "item") setInventoryList(prev => prev.filter(i => i.inventoryNo !== no));
                else setIconList(prev => prev.filter(i => i.memberIconId !== no));
                toast.success("회수 처리가 완료되었습니다.");
            } catch { toast.error("회수 실패"); }
        }
    };

    const handleGrant = async (type, targetNo, name) => {
        try {
            const url = type === "item" ? `/admin/inventory/${searchId}/${targetNo}` : `/admin/icon/${searchId}/${targetNo}`;
            await axios.post(url);
            
            // 알림창 z-index 보정 추가
            await Swal.fire({ 
                icon: 'success', 
                title: '지급 완료', 
                text: `[${name}] 지급되었습니다.`, 
                timer: 1500, 
                showConfirmButton: false, 
                background: '#1a1a1a', 
                color: '#fff',
                didOpen: () => (Swal.getContainer().style.zIndex = "3000") 
            });
            
            fetchUserData();
        } catch { 
            Swal.fire({
                icon: "error",
                title: "지급 실패",
                text: "이미 보유 중이거나 시스템 오류입니다.",
                didOpen: () => (Swal.getContainer().style.zIndex = "3000")
            }); 
        }
    };

    return (
        <Admin>
            <div className="ai-wrapper">
                <div className="ai-container mt-4">
                    <h2 className="ai-title mb-4">🛡️ 자산 관리 (Admin)</h2>
                    
                    <div className="ai-search-card mb-4">
                        <div className="ai-flex-row ai-gap-2">
                            <input className="ai-search-input" placeholder="조회할 유저 ID 입력" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUserData()} />
                            <button className="ai-btn-main" onClick={fetchUserData} disabled={loading}>
                                {loading ? "로딩..." : "조회"}
                            </button>
                            <button className="ai-btn-success ai-ms-auto" onClick={() => setShowModal(true)} disabled={!searchId}>➕ 자산 수동 지급</button>
                        </div>
                    </div>

                    <div className="ai-tab-group mb-3">
                        <button className={`ai-tab-link ${viewTab === "item" ? "active" : ""}`} onClick={() => setViewTab("item")}>인벤토리 ({inventoryList.length})</button>
                        <button className={`ai-tab-link ${viewTab === "icon" ? "active" : ""}`} onClick={() => setViewTab("icon")}>아이콘 ({iconList.length})</button>
                    </div>

                    <div className="ai-table-container">
                        <table className="ai-table">
                            <thead>
                                <tr>
                                    <th>미리보기</th><th>이름</th><th>유형/등급</th><th>획득일</th><th className="ai-text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="ai-text-center ai-py-5">데이터 로딩 중...</td></tr>
                                ) : viewTab === "item" ? (
                                    inventoryList.length > 0 ? inventoryList.map(item => (
                                        <tr key={item.inventoryNo}>
                                            <td><img src={item.pointItemSrc} width="40" height="40" className="ai-rounded" alt="" /></td>
                                            <td className="ai-fw-bold">{item.pointItemName}</td>
                                            <td><span className="ai-badge-gray">{item.pointItemType}</span></td>
                                            <td className="ai-text-small">{item.inventoryCreatedAt}</td>
                                            <td className="ai-text-center"><button className="ai-btn-recall" onClick={() => handleRecall("item", item.inventoryNo, item.pointItemName)}>회수</button></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="ai-text-center ai-py-5">데이터가 없습니다.</td></tr>
                                ) : (
                                    iconList.length > 0 ? iconList.map(icon => (
                                        <tr key={icon.memberIconId}>
                                            <td><img src={icon.iconSrc} width="40" height="40" className="ai-rounded" alt="" /></td>
                                            <td className="ai-fw-bold">{icon.iconName}</td>
                                            <td><span className={`ai-badge-rarity rarity-${icon.iconRarity?.toLowerCase()}`}>{icon.iconRarity}</span></td>
                                            <td className="ai-text-small">{icon.memberIconObtainTime}</td>
                                            <td className="ai-text-center"><button className="ai-btn-recall" onClick={() => handleRecall("icon", icon.memberIconId, icon.iconName)}>회수</button></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="ai-text-center ai-py-5">보유 중인 아이콘이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {showModal && (
                        <div className="ai-modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
                                <div className="ai-modal-header">
                                    <h5 className="ai-modal-title">🎁 자산 지급 (대상: {searchId})</h5>
                                    <button className="ai-btn-close" onClick={() => setShowModal(false)}>×</button>
                                </div>
                                <div className="ai-modal-body">
                                    <div className="ai-flex-row ai-gap-2 mb-4">
                                        <button className={`ai-btn-tab-sm ${grantTab === "item" ? "active" : ""}`} onClick={() => setGrantTab("item")}>상점 아이템</button>
                                        <button className={`ai-btn-tab-sm ${grantTab === "icon" ? "active" : ""}`} onClick={() => setGrantTab("icon")}>마스터 아이콘</button>
                                    </div>
                                    <div className="ai-grant-grid">
                                        {(grantTab === "item" ? storeItems : masterIcons).map(data => (
                                            <div className="ai-grant-card" key={grantTab === "item" ? data.pointItemNo : data.iconId}>
                                                <img src={grantTab === "item" ? data.pointItemSrc : data.iconSrc} className="ai-grant-img" alt="" />
                                                <div className="ai-grant-name">{grantTab === "item" ? data.pointItemName : data.iconName}</div>
                                                <button className="ai-btn-give" onClick={() => handleGrant(grantTab, grantTab === "item" ? data.pointItemNo : data.iconId, grantTab === "item" ? data.pointItemName : data.iconName)}>지급</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Admin>
    );
}