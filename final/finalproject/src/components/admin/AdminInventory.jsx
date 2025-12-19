import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Admin from "../guard/Admin";

export default function AdminInventory() {

    // ===== 상태 =====
    const [searchId, setSearchId] = useState("");

    // 조회용 탭 / 지급용 탭 분리
    const [viewTab, setViewTab] = useState("item");
    const [grantTab, setGrantTab] = useState("item");

    const [inventoryList, setInventoryList] = useState([]);
    const [iconList, setIconList] = useState([]);

    const [storeItems, setStoreItems] = useState([]);
    const [masterIcons, setMasterIcons] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // ===== 초기 마스터 데이터 =====
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [resItems, resIcons] = await Promise.all([
                    axios.get("/admin/inventory/item-list"),
                    axios.get("/admin/icon/list")
                ]);
                setStoreItems(resItems.data);
                setMasterIcons(resIcons.data);
            } catch (err) {
                console.error("마스터 데이터 로드 실패", err);
            }
        };
        loadMasterData();
    }, []);

    // ===== 유저 자산 조회 =====
    const fetchUserData = useCallback(async () => {
        if (!searchId.trim()) return;
        setLoading(true);
        try {
            const [resInv, resIcon] = await Promise.all([
                axios.get(`/admin/inventory/${searchId}`),
                axios.get(`/admin/icon/${searchId}`)
            ]);
            setInventoryList(resInv.data);
            setIconList(resIcon.data);
        } catch {
            alert("조회 중 오류 발생");
        } finally {
            setLoading(false);
        }
    }, [searchId]);

    // ===== 회수 =====
    const handleRecall = async (type, no) => {
        if (!window.confirm("정말 강제 회수하시겠습니까?")) return;
        try {
            const url = type === "item"
                ? `/admin/inventory/${no}`
                : `/admin/icon/${no}`;

            await axios.delete(url);

            if (type === "item") {
                setInventoryList(prev => prev.filter(i => i.inventoryNo !== no));
            } else {
                setIconList(prev => prev.filter(i => i.memberIconId !== no));
            }
            alert("회수 완료");
        } catch {
            alert("회수 실패");
        }
    };

    // ===== 지급 =====
    const handleGrant = async (type, targetNo) => {
        try {
            const url = type === "item"
                ? `/admin/inventory/${searchId}/${targetNo}`
                : `/admin/icon/${searchId}/${targetNo}`;

            await axios.post(url);
            alert("지급 완료");
            setShowModal(false);
            fetchUserData();
        } catch {
            alert("지급 실패 (이미 보유 중일 수 있음)");
        }
    };

    return (
        <Admin>
            <div className="container mt-4 text-white">

                <h2 className="mb-4">🛡️ 관리자 자산 관리</h2>

                {/* 검색 */}
                <div className="card bg-dark p-4 mb-4">
                    <div className="d-flex gap-2">
                        <input
                            className="form-control bg-secondary text-white"
                            placeholder="유저 ID"
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={fetchUserData} disabled={loading}>
                            조회
                        </button>
                        <button
                            className="btn btn-success ms-auto"
                            onClick={() => setShowModal(true)}
                            disabled={!searchId}
                        >
                            ➕ 선물하기
                        </button>
                    </div>
                </div>

                {/* 조회 탭 */}
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${viewTab === "item" ? "active" : ""}`}
                            onClick={() => setViewTab("item")}
                        >
                            🎒 인벤토리
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${viewTab === "icon" ? "active" : ""}`}
                            onClick={() => setViewTab("icon")}
                        >
                            🎨 아이콘
                        </button>
                    </li>
                </ul>

                {/* 목록 */}
                <table className="table table-dark table-hover">
                    <thead>
                        <tr>
                            <th>미리보기</th>
                            <th>이름</th>
                            <th>유형</th>
                            <th>획득일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viewTab === "item" ? (
                            inventoryList.map(item => (
                                <tr key={item.inventoryNo}>
                                    <td><img src={item.pointItemSrc} width="40" /></td>
                                    <td>{item.pointItemName}</td>
                                    <td>{item.pointItemType}</td>
                                    <td>{item.inventoryCreatedAt}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleRecall("item", item.inventoryNo)}
                                        >
                                            회수
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            iconList.map(icon => (
                                <tr key={icon.memberIconId}>
                                    <td><img src={icon.iconSrc} width="40" /></td>
                                    <td>{icon.iconName}</td>
                                    <td>{icon.iconRarity}</td>
                                    <td>{icon.memberIconObtainTime}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleRecall("icon", icon.memberIconId)}
                                        >
                                            회수
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* 지급 모달 */}
                {showModal && (
                    <div className="modal show d-block bg-dark bg-opacity-75">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content bg-dark text-white">
                                <div className="modal-header">
                                    <h5>자산 지급 - {searchId}</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
                                </div>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <button
                                            className={`btn btn-sm me-2 ${grantTab === "item" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setGrantTab("item")}
                                        >
                                            아이템
                                        </button>
                                        <button
                                            className={`btn btn-sm ${grantTab === "icon" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setGrantTab("icon")}
                                        >
                                            아이콘
                                        </button>
                                    </div>

                                    <div className="row g-3">
                                        {(grantTab === "item" ? storeItems : masterIcons).map(data => (
                                            <div className="col-3" key={grantTab === "item" ? data.pointItemNo : data.iconId}>
                                                <div className="border p-2 text-center rounded">
                                                    <img
                                                        src={grantTab === "item" ? data.pointItemSrc : data.iconSrc}
                                                        width="50"
                                                    />
                                                    <p className="small mt-2">
                                                        {grantTab === "item" ? data.pointItemName : data.iconName}
                                                    </p>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() =>
                                                            handleGrant(
                                                                grantTab,
                                                                grantTab === "item" ? data.pointItemNo : data.iconId
                                                            )
                                                        }
                                                    >
                                                        지급
                                                    </button>
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
        </Admin>
    );
}
