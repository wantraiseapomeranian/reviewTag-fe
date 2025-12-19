import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AdminPoint.css'; 

export default function AdminPoint() {
    const navigate = useNavigate(); 

    // 탭 상태 (POINT: 포인트/회원관리, ICON: 아이콘관리)
    const [activeTab, setActiveTab] = useState("POINT");

    // ================= [TAB 1] 포인트 및 회원 관리 상태 =================
    const [memberList, setMemberList] = useState([]); 
    const [keyword, setKeyword] = useState(""); 
    const [inputPoints, setInputPoints] = useState({});
    const [pointPage, setPointPage] = useState(1);
    const [pointTotalPage, setPointTotalPage] = useState(0);
    const [pointTotalCount, setPointTotalCount] = useState(0);
    const [editModeId, setEditModeId] = useState(null);
    const [editData, setEditData] = useState({ memberNickname: "", memberLevel: "" });

    // 회원 목록 로드
    const loadMembers = useCallback(async () => {
        try {
            const resp = await axios.get("/admin/point/list", {
                params: { keyword: keyword, page: pointPage, size: 10 }
            });
            setMemberList(resp.data.list || []);
            setPointTotalPage(resp.data.totalPage || 0);
            setPointTotalCount(resp.data.totalCount || 0);
        } catch (e) {
            console.error("회원 로드 실패", e);
            toast.error("회원 목록을 불러오지 못했습니다.");
        }
    }, [keyword, pointPage]);

    useEffect(() => {
        if(activeTab === "POINT") loadMembers();
    }, [activeTab, pointPage, loadMembers]);

    // 포인트 지급/차감
    const handlePointUpdate = async (memberId, mode) => {
        const amountStr = inputPoints[memberId];
        if (!amountStr || isNaN(amountStr)) return toast.warning("숫자를 입력하세요.");
        
        const amountValue = parseInt(amountStr);
        const finalAmount = mode === 'minus' ? -amountValue : amountValue;

        const result = await Swal.fire({
            title: mode === 'plus' ? '포인트 지급' : '포인트 차감',
            text: `${memberId}님에게 ${amountValue}P를 ${mode === 'plus' ? '지급' : '차감'}하시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: mode === 'plus' ? '#238636' : '#da3633',
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            background: '#161b22',
            color: '#f0f6fc'
        });

        if (result.isConfirmed) {
            try {
                await axios.post("/admin/point/update", { memberId, amount: finalAmount });
                toast.success(`포인트 처리가 완료되었습니다.`);
                loadMembers();
                setInputPoints({ ...inputPoints, [memberId]: "" });
            } catch (e) { toast.error("처리 중 오류 발생"); }
        }
    };

    // 회원 정보 수정 저장
    const saveEdit = async (memberId) => {
        try {
            await axios.post("/admin/point/edit", { memberId, ...editData });
            toast.success("회원 정보가 수정되었습니다.");
            setEditModeId(null);
            loadMembers();
        } catch (e) { toast.error("수정 실패"); }
    };

    // ================= [TAB 2] 아이콘 DB 관리 상태 =================
    const [iconList, setIconList] = useState([]);
    const [iconFilter, setIconFilter] = useState("ALL");
    const [iconPage, setIconPage] = useState(1);
    const [iconTotalPage, setIconTotalPage] = useState(0);
    const [iconTotalCount, setIconTotalCount] = useState(0);
    const [iconForm, setIconForm] = useState({ iconId: 0, iconName: "", iconRarity: "COMMON", iconSrc: "" });
    const [isIconEdit, setIsIconEdit] = useState(false);

    const loadIcons = useCallback(async () => {
        try {
            const resp = await axios.get(`/admin/point/icon/list`, {
                params: { page: iconPage, type: iconFilter }
            });
            setIconList(resp.data.list || []);
            setIconTotalCount(resp.data.totalCount || 0);
            setIconTotalPage(resp.data.totalPage || 0);
        } catch(e) { console.error("아이콘 로드 실패", e); }
    }, [iconPage, iconFilter]);

    useEffect(() => {
        if(activeTab === "ICON") loadIcons();
    }, [activeTab, iconPage, iconFilter, loadIcons]);

    // 아이콘 등록/수정 제출
    const handleIconSubmit = async () => {
        if(!iconForm.iconName || !iconForm.iconSrc) return toast.warning("이름과 소스 URL은 필수입니다.");
        try {
            const url = isIconEdit ? "/admin/point/icon/edit" : "/admin/point/icon/add";
            await axios.post(url, iconForm);
            toast.success(isIconEdit ? "아이콘이 수정되었습니다." : "새 아이콘이 등록되었습니다.");
            setIsIconEdit(false);
            setIconForm({ iconId: 0, iconName: "", iconRarity: "COMMON", iconSrc: "" });
            loadIcons();
        } catch(e) { toast.error("처리 중 오류 발생"); }
    };

    // 아이콘 삭제
    const handleIconDelete = async (id, name) => {
        const result = await Swal.fire({
            title: '아이콘 삭제',
            text: `[${name}] 아이콘을 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#da3633',
            background: '#161b22', color: '#f0f6fc'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`/admin/point/icon/delete/${id}`);
                toast.success("삭제 완료");
                loadIcons();
            } catch(e) { toast.error("삭제 실패"); }
        }
    };

    // 공통 페이지네이션 렌더러
    const renderPagination = (current, total, setter) => {
        if (total <= 1) return null;
        let pages = [];
        for (let i = 1; i <= total; i++) {
            pages.push(
                <button key={i} className={`btn-pagination ${current === i ? 'active' : ''}`} onClick={() => setter(i)}>
                    {i}
                </button>
            );
        }
        return <div className="pagination-group">{pages}</div>;
    };

    return (
        <div className="admin-point-container">
            <div className="admin-max-width">
                
                {/* 상단 탭 제어 */}
                <div className="admin-header-flex">
                    <h2 className="admin-title">🛡️ 시스템 관리자 모드</h2>
                    <div className="admin-tab-group">
                        <button className={`tab-item ${activeTab === 'POINT' ? 'active' : ''}`} onClick={() => setActiveTab('POINT')}>💰 포인트/회원</button>
                        <button className={`tab-item ${activeTab === 'ICON' ? 'active' : ''}`} onClick={() => setActiveTab('ICON')}>🎨 아이콘 DB</button>
                        <button className="tab-item store-link" onClick={() => navigate('/point/main')}>🏠 상점가기</button>
                    </div>
                </div>

                {/* [TAB 1] 포인트 관리 섹션 */}
                {activeTab === 'POINT' && (
                    <div className="admin-content-card">
                        <div className="search-bar">
                            <input type="text" className="glass-input" placeholder="유저 ID 또는 닉네임 검색..." value={keyword} onChange={e => setKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && loadMembers()} />
                            <button className="search-btn" onClick={loadMembers}>조회</button>
                        </div>

                        <table className="admin-glass-table">
                            <thead>
                                <tr><th>회원정보</th><th>등급</th><th>보유 포인트</th><th>포인트 조절</th><th>작업</th></tr>
                            </thead>
                            <tbody>
                                {memberList.map((m) => {
                                    const isEditing = editModeId === m.memberId;
                                    return (
                                        <tr key={m.memberId}>
                                            <td className="text-left">
                                                <div className="id-txt">{m.memberId}</div>
                                                {isEditing ? 
                                                    <input className="edit-input" value={editData.memberNickname} onChange={e => setEditData({...editData, memberNickname: e.target.value})} /> 
                                                    : <div className="nick-txt">{m.memberNickname}</div>}
                                            </td>
                                            <td>
                                                {isEditing ? 
                                                    <select className="edit-select" value={editData.memberLevel} onChange={e => setEditData({...editData, memberLevel: e.target.value})}>
                                                        <option>일반회원</option><option>우수회원</option><option>VIP</option><option>관리자</option>
                                                    </select> 
                                                    : <span className={`badge-lv ${m.memberLevel === '관리자' ? 'admin' : 'user'}`}>{m.memberLevel}</span>}
                                            </td>
                                            <td className="point-amount">{m.memberPoint.toLocaleString()} P</td>
                                            <td>
                                                <div className="point-control">
                                                    <input type="number" className="point-input" placeholder="0" value={inputPoints[m.memberId] || ""} onChange={e => setInputPoints({...inputPoints, [m.memberId]: e.target.value})} />
                                                    <button className="btn-point plus" onClick={() => handlePointUpdate(m.memberId, 'plus')}>+</button>
                                                    <button className="btn-point minus" onClick={() => handlePointUpdate(m.memberId, 'minus')}>-</button>
                                                </div>
                                            </td>
                                            <td>
                                                {isEditing ? 
                                                    <div className="btn-group-sm">
                                                        <button className="btn-save" onClick={() => saveEdit(m.memberId)}>저장</button>
                                                        <button className="btn-cancel" onClick={() => setEditModeId(null)}>취소</button>
                                                    </div> 
                                                    : <button className="btn-edit" onClick={() => { setEditModeId(m.memberId); setEditData({ memberNickname: m.memberNickname, memberLevel: m.memberLevel }); }}>수정</button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {renderPagination(pointPage, pointTotalPage, setPointPage)}
                    </div>
                )}

                {/* [TAB 2] 아이콘 관리 섹션 */}
                {activeTab === 'ICON' && (
                    <div className="admin-content-card">
                        <div className="icon-form-box">
                            <h5 className="form-title">{isIconEdit ? "✏️ 아이콘 수정" : "➕ 새 아이콘 등록"}</h5>
                            <div className="d-flex gap-2 mb-3">
                                <input type="text" className="glass-input" placeholder="아이콘 이름" value={iconForm.iconName} onChange={e => setIconForm({...iconForm, iconName: e.target.value})} />
                                <select className="glass-input" value={iconForm.iconRarity} onChange={e => setIconForm({...iconForm, iconRarity: e.target.value})}>
                                    <option>COMMON</option><option>RARE</option><option>EPIC</option><option>UNIQUE</option><option>LEGENDARY</option><option>EVENT</option>
                                </select>
                                <input type="text" className="glass-input flex-grow-1" placeholder="이미지 URL (https://...)" value={iconForm.iconSrc} onChange={e => setIconForm({...iconForm, iconSrc: e.target.value})} />
                                <button className="search-btn active" onClick={handleIconSubmit}>{isIconEdit ? "수정완료" : "등록"}</button>
                                {isIconEdit && <button className="search-btn" onClick={() => { setIsIconEdit(false); setIconForm({ iconId: 0, iconName: "", iconRarity: "COMMON", iconSrc: "" }); }}>취소</button>}
                            </div>
                        </div>

                        <div className="filter-bar">
                            {['ALL', 'COMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY'].map(f => (
                                <button key={f} className={`filter-pill ${iconFilter === f ? 'active' : ''}`} onClick={() => { setIconFilter(f); setIconPage(1); }}>{f}</button>
                            ))}
                        </div>

                        <table className="admin-glass-table">
                            <thead>
                                <tr><th>ID</th><th>미리보기</th><th>아이콘 명칭</th><th>등급</th><th>관리</th></tr>
                            </thead>
                            <tbody>
                                {iconList.map(icon => (
                                    <tr key={icon.iconId}>
                                        <td className="text-secondary">{icon.iconId}</td>
                                        <td><img src={icon.iconSrc} alt="preview" className="icon-preview-img" /></td>
                                        <td className="fw-bold">{icon.iconName}</td>
                                        <td><span className={`rarity-badge ${icon.iconRarity.toLowerCase()}`}>{icon.iconRarity}</span></td>
                                        <td>
                                            <div className="btn-group-sm">
                                                <button className="btn-edit" onClick={() => { setIconForm(icon); setIsIconEdit(true); window.scrollTo(0, 0); }}>수정</button>
                                                <button className="btn-cancel" onClick={() => handleIconDelete(icon.iconId, icon.iconName)}>삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {renderPagination(iconPage, iconTotalPage, setIconPage)}
                    </div>
                )}
            </div>
        </div>
    );
}