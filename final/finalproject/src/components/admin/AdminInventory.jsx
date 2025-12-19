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
    
    // [개선] 마스터 데이터 로드 (에러 핸들링 추가)
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
                console.error("마스터 로드 실패", err);
                toast.error("시스템 아이콘/아이템 목록을 불러오지 못했습니다.");
            }
        };
        loadMasterData();
    }, []);

    // [개선] 검색어 변경 시 목록 초기화 (이전 유저 데이터 혼동 방지)
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
            if(resInv.data.length === 0 && resIcon.data.length === 0) {
                toast.info("해당 유저의 자산이 비어있습니다.");
            } else {
                toast.info("자산 정보를 동기화했습니다.");
            }
        } catch (err) {
            Swal.fire("조회 실패", "존재하지 않는 유저이거나 서버 오류입니다.", "error");
        } finally { setLoading(false); }
    }, [searchId]);

    const handleRecall = async (type, no, name) => {
        const result = await Swal.fire({
            title: '⚠️ 자산 강제 회수',
            text: `[${name}]을(를) 회수하시겠습니까? 삭제 후 복구가 불가능합니다.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '회수 실행',
            cancelButtonText: '취소',
            background: '#1a1a1a', color: '#fff'
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
            await Swal.fire({ 
                icon: 'success', title: '지급 완료', 
                text: `[${name}] 아이템이 성공적으로 지급되었습니다.`, 
                timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' 
            });
            fetchUserData();
        } catch { 
            Swal.fire("지급 실패", "이미 보유 중인 아이콘이거나 시스템 오류입니다.", "error"); 
        }
    };

    return (
        <Admin>
            <div className="admin-inventory-wrapper">
                <div className="container mt-4 text-white">
                    <h2 className="fw-bold mb-4">🛡️ 자산 관리 (Admin)</h2>
                    
                    <div className="search-glass-card mb-4">
                        <div className="d-flex gap-2">
                            <input className="form-control admin-search-input" placeholder="조회할 유저 ID 입력" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUserData()} />
                            <button className="btn btn-primary px-4 fw-bold" onClick={fetchUserData} disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : "조회"}
                            </button>
                            <button className="btn btn-success ms-auto fw-bold" onClick={() => setShowModal(true)} disabled={!searchId}>➕ 자산 수동 지급</button>
                        </div>
                    </div>

                    <ul className="nav nav-tabs admin-nav-tabs mb-3">
                        <li className="nav-item"><button className={`nav-link ${viewTab === "item" ? "active" : ""}`} onClick={() => setViewTab("item")}>인벤토리 ({inventoryList.length})</button></li>
                        <li className="nav-item"><button className={`nav-link ${viewTab === "icon" ? "active" : ""}`} onClick={() => setViewTab("icon")}>아이콘 ({iconList.length})</button></li>
                    </ul>

                    <div className="table-glass-container">
                        <table className="table table-dark table-hover admin-table align-middle">
                            <thead>
                                <tr>
                                    <th>미리보기</th><th>이름</th><th>유형/등급</th><th>획득일</th><th className="text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-5">데이터를 가져오는 중입니다...</td></tr>
                                ) : viewTab === "item" ? (
                                    inventoryList.length > 0 ? inventoryList.map(item => (
                                        <tr key={item.inventoryNo}>
                                            <td><img src={item.pointItemSrc} width="40" height="40" className="rounded" onError={(e) => e.target.src = "/placeholder-img.png"} /></td>
                                            <td className="fw-bold">{item.pointItemName}</td>
                                            <td><span className="badge bg-secondary">{item.pointItemType}</span></td>
                                            <td className="small text-secondary">{item.inventoryCreatedAt}</td>
                                            <td className="text-center"><button className="btn btn-outline-danger btn-sm" onClick={() => handleRecall("item", item.inventoryNo, item.pointItemName)}>회수</button></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="text-center py-5 text-secondary">표시할 인벤토리 정보가 없습니다.</td></tr>
                                ) : (
                                    iconList.length > 0 ? iconList.map(icon => (
                                        <tr key={icon.memberIconId}>
                                            <td><img src={icon.iconSrc} width="40" height="40" className="rounded" onError={(e) => e.target.src = "/placeholder-icon.png"} /></td>
                                            <td className="fw-bold">{icon.iconName}</td>
                                            <td><span className={`badge rarity-${icon.iconRarity?.toLowerCase()}`}>{icon.iconRarity}</span></td>
                                            <td className="small text-secondary">{icon.memberIconObtainTime}</td>
                                            <td className="text-center"><button className="btn btn-outline-danger btn-sm" onClick={() => handleRecall("icon", icon.memberIconId, icon.iconName)}>회수</button></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="text-center py-5 text-secondary">보유 중인 아이콘이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 지급 모달 */}
                    {showModal && (
                        <div className="modal show d-block admin-modal-backdrop" onClick={() => setShowModal(false)}>
                            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
                                <div className="modal-content glass-modal-content">
                                    <div className="modal-header border-0 pb-0">
                                        <h5 className="modal-title fw-bold">🎁 자산 수동 지급 (대상: {searchId})</h5>
                                        <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
                                    </div>
                                    <div className="modal-body">
                                        <div className="d-flex gap-2 mb-4">
                                            <button className={`btn btn-sm ${grantTab === "item" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setGrantTab("item")}>상점 아이템</button>
                                            <button className={`btn btn-sm ${grantTab === "icon" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setGrantTab("icon")}>마스터 아이콘</button>
                                        </div>
                                        <div className="row g-3 admin-grant-list">
                                            {(grantTab === "item" ? storeItems : masterIcons).map(data => (
                                                <div className="col-4 col-md-3" key={grantTab === "item" ? data.pointItemNo : data.iconId}>
                                                    <div className="grant-card p-3 text-center h-100 d-flex flex-column">
                                                        <div className="flex-grow-1">
                                                            <img src={grantTab === "item" ? data.pointItemSrc : data.iconSrc} width="50" height="50" className="mb-2 rounded" />
                                                            <div className="small fw-bold text-truncate">{grantTab === "item" ? data.pointItemName : data.iconName}</div>
                                                            {grantTab === 'icon' && <div className="admin-rarity-text">{data.iconRarity}</div>}
                                                        </div>
                                                        <button className="btn btn-primary btn-xs w-100 mt-2" onClick={() => handleGrant(grantTab, grantTab === "item" ? data.pointItemNo : data.iconId, grantTab === "item" ? data.pointItemName : data.iconName)}>지급</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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