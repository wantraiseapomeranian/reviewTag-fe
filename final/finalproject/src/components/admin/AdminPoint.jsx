import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AdminPoint.css'; 
import { Modal } from 'bootstrap';

export default function AdminPoint() {
    const navigate = useNavigate(); 

    // 탭 상태 (POINT: 포인트/회원관리, ICON: 아이콘관리)
    const [activeTab, setActiveTab] = useState("POINT");
    const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    
    // 검색 및 모달 관련 상태
    const [query, setQuery] = useState("");
    const [resultList, setResultList] = useState([]);
    const [contentsDetail, setContentsDetail] = useState({contentsId: null, contentsTitle: ""});
    const [isSelect, setIsSelect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    
    // 모달용 도구
    const modal = useRef();
    const openModal = useCallback(() => {
        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();
    }, [modal]);
    const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

    // [TAB 1] 포인트 및 회원 관리 상태
    const [memberList, setMemberList] = useState([]); 
    const [keyword, setKeyword] = useState(""); 
    const [inputPoints, setInputPoints] = useState({});
    const [pointPage, setPointPage] = useState(1);
    const [pointTotalPage, setPointTotalPage] = useState(0);
    const [pointTotalCount, setPointTotalCount] = useState(0);
    const [editModeId, setEditModeId] = useState(null);
    const [editData, setEditData] = useState({ memberNickname: "", memberLevel: "" });

    const loadMembers = useCallback(async () => {
        try {
            const resp = await axios.get("/admin/point/list", {
                params: { keyword: keyword, page: pointPage, size: 10 }
            });
            setMemberList(resp.data.list || []);
            setPointTotalPage(resp.data.totalPage || 0);
            setPointTotalCount(resp.data.totalCount || 0);
        } catch (e) {
            toast.error("회원 목록을 불러오지 못했습니다.");
        }
    }, [keyword, pointPage]);

    useEffect(() => {
        if(activeTab === "POINT") loadMembers();
    }, [activeTab, pointPage, loadMembers]);

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
            background: '#161b22', color: '#f0f6fc'
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

    const saveEdit = async (memberId) => {
        try {
            await axios.post("/admin/point/edit", { memberId, ...editData });
            toast.success("회원 정보가 수정되었습니다.");
            setEditModeId(null);
            loadMembers();
        } catch (e) { toast.error("수정 실패"); }
    };

    // [TAB 2] 아이콘 DB 관리 상태
    const [iconList, setIconList] = useState([]);
    const [iconFilter, setIconFilter] = useState("ALL");
    const [iconPage, setIconPage] = useState(1);
    const [iconTotalPage, setIconTotalPage] = useState(0);
    const [iconTotalCount, setIconTotalCount] = useState(0);
    const [iconForm, setIconForm] = useState({ iconId: 0, iconName: "", iconCategory : "DEFAULT", iconRarity: "COMMON", iconSrc: "", iconContents:"" });
    const [isIconEdit, setIsIconEdit] = useState(false);

    const loadIcons = useCallback(async () => {
        try {
            const resp = await axios.get(`/admin/point/icon/list`, {
                params: { page: iconPage, type: iconFilter }
            });
            setIconList(resp.data.list || []);
            setIconTotalCount(resp.data.totalCount || 0);
            setIconTotalPage(resp.data.totalPage || 0);
        } catch(e) { console.error(e); }
    }, [iconPage, iconFilter]);

    useEffect(() => {
        if(activeTab === "ICON") loadIcons();
    }, [activeTab, iconPage, iconFilter, loadIcons]);

    const handleIconSubmit = async () => {
        if(!iconForm.iconName || !iconForm.iconSrc) return toast.warning("이름과 소스 URL은 필수입니다.");
        try {
            const url = isIconEdit ? "/admin/point/icon/edit" : "/admin/point/icon/add";
            await axios.post(url, iconForm);
            toast.success(isIconEdit ? "아이콘이 수정되었습니다." : "새 아이콘이 등록되었습니다.");
            setIsIconEdit(false);
            setIconForm({ iconId: 0, iconName: "", iconCategory : "DEFAULT", iconRarity: "COMMON", iconSrc: "" });
            setContentsDetail({contentsId: null, contentsTitle: ""});
            loadIcons();
        } catch(e) { toast.error("처리 중 오류 발생"); }
    };

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

    const renderPagination = (current, total, setter) => {
        if (total <= 1) return null;
        let pages = [];
        for (let i = 1; i <= total; i++) {
            pages.push(
                <button key={i} className={`ap-btn-pagination ${current === i ? 'active' : ''}`} onClick={() => setter(i)}>
                    {i}
                </button>
            );
        }
        return <div className="ap-pagination-group">{pages}</div>;
    };

    const handleSearch = useCallback(async () => {
        if (query.trim().length === 0) { setResultList([]); return; }
        try {
            const response = await axios.get("/api/tmdb/search", { params: { query } });
            setResultList(response.data);
        } catch (error) { setStatusMessage("검색 중 서버 오류 발생"); }
    }, [query]);

    const handleSelectAndSave = useCallback(async (contents) => {
        setIsLoading(true);
        try {
            const response = await axios.post("/api/tmdb/save", { contentsId: contents.contentsId, type: contents.type });
            setContentsDetail(response.data);
            setIconForm(prev => ({ ...prev, iconContents: contents.contentsId }));
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); closeModal(); }
    }, [closeModal]);

    return (
        <div className="ap-container">
            <div className="ap-max-width">
                
                <div className="ap-header-flex">
                    <h2 className="ap-title">🛡️ 시스템 관리자 모드</h2>
                    <div className="ap-tab-group">
                        <button className={`ap-tab-item ${activeTab === 'POINT' ? 'active' : ''}`} onClick={() => setActiveTab('POINT')}>💰 포인트/회원</button>
                        <button className={`ap-tab-item ${activeTab === 'ICON' ? 'active' : ''}`} onClick={() => setActiveTab('ICON')}>🎨 아이콘 DB</button>
                        <button className="ap-tab-item ap-store-link" onClick={() => navigate('/point/main')}>🏠 상점가기</button>
                    </div>
                </div>

                {/* [TAB 1] 포인트 관리 섹션 */}
                {activeTab === 'POINT' && (
                    <div className="ap-content-card">
                        <div className="ap-search-bar">
                            <input type="text" className="ap-glass-input" placeholder="유저 ID 또는 닉네임 검색..." value={keyword} onChange={e => setKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && loadMembers()} />
                            <button className="ap-search-btn" onClick={loadMembers}>조회</button>
                        </div>

                        <table className="ap-table">
                            <thead>
                                <tr><th>회원정보</th><th>등급</th><th>보유 포인트</th><th>포인트 조절</th><th>작업</th></tr>
                            </thead>
                            <tbody>
                                {memberList.map((m) => {
                                    const isEditing = editModeId === m.memberId;
                                    return (
                                        <tr key={m.memberId}>
                                            <td className="ap-text-left">
                                                <div className="ap-id-txt">{m.memberId}</div>
                                                {isEditing ? 
                                                    <input className="ap-edit-input" value={editData.memberNickname} onChange={e => setEditData({...editData, memberNickname: e.target.value})} /> 
                                                    : <div className="ap-nick-txt">{m.memberNickname}</div>}
                                            </td>
                                            <td>
                                                {isEditing ? 
                                                    <select className="ap-edit-select" value={editData.memberLevel} onChange={e => setEditData({...editData, memberLevel: e.target.value})}>
                                                        <option>일반회원</option><option>우수회원</option><option>VIP</option><option>관리자</option>
                                                    </select> 
                                                    : <span className={`ap-badge-lv ${m.memberLevel === '관리자' ? 'admin' : 'user'}`}>{m.memberLevel}</span>}
                                            </td>
                                            <td className="ap-point-amount">{m.memberPoint.toLocaleString()} P</td>
                                            <td>
                                                <div className="ap-point-control">
                                                    <input type="number" className="ap-point-input" placeholder="0" value={inputPoints[m.memberId] || ""} onChange={e => setInputPoints({...inputPoints, [m.memberId]: e.target.value})} />
                                                    <button className="ap-btn-point plus" onClick={() => handlePointUpdate(m.memberId, 'plus')}>+</button>
                                                    <button className="ap-btn-point minus" onClick={() => handlePointUpdate(m.memberId, 'minus')}>-</button>
                                                </div>
                                            </td>
                                            <td>
                                                {isEditing ? 
                                                    <div className="ap-btn-group-sm">
                                                        <button className="ap-btn-save" onClick={() => saveEdit(m.memberId)}>저장</button>
                                                        <button className="ap-btn-cancel" onClick={() => setEditModeId(null)}>취소</button>
                                                    </div> 
                                                    : <button className="ap-btn-edit" onClick={() => { setEditModeId(m.memberId); setEditData({ memberNickname: m.memberNickname, memberLevel: m.memberLevel }); }}>수정</button>}
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
                    <div className="ap-content-card">
                        <div className="ap-icon-form-box">
                            <h5 className="ap-form-title">{isIconEdit ? "✏️ 아이콘 수정" : "➕ 새 아이콘 등록"}</h5>
                            <div className="ap-flex-row ap-mt-1">
                                <div className="ap-input-group-custom" onClick={openModal}>
                                    <input type="text" className="ap-glass-input ap-w-100" value={contentsDetail.contentsTitle || ""} placeholder="관련 컨텐츠 선택" readOnly />
                                    {contentsDetail.contentsId && <span className="ap-badge-selected">선택됨</span>}
                                </div>
                            </div>
                            <div className="ap-flex-row ap-mt-2 ap-gap-2">
                                <input type="text" className="ap-glass-input" placeholder="아이콘 이름" value={iconForm.iconName} onChange={e => setIconForm({...iconForm, iconName: e.target.value})} />
                                <select className="ap-glass-input" value={iconForm.iconRarity} onChange={e => setIconForm({...iconForm, iconRarity: e.target.value})}>
                                    <option>COMMON</option><option>RARE</option><option>EPIC</option><option>UNIQUE</option><option>LEGENDARY</option><option>EVENT</option>
                                </select>
                                <input type="text" className="ap-glass-input ap-flex-grow" placeholder="이미지 URL (https://...)" value={iconForm.iconSrc} onChange={e => setIconForm({...iconForm, iconSrc: e.target.value})} />
                                <button className="ap-btn-main active" onClick={handleIconSubmit}>{isIconEdit ? "수정완료" : "등록"}</button>
                                {isIconEdit && <button className="ap-btn-main" onClick={() => { setIsIconEdit(false); setIconForm({ iconId: 0, iconName: "", iconRarity: "COMMON", iconSrc: "" }); }}>취소</button>}
                            </div>
                        </div>

                        <div className="ap-filter-bar">
                            {['ALL', 'COMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY'].map(f => (
                                <button key={f} className={`ap-filter-pill ${iconFilter === f ? 'active' : ''}`} onClick={() => { setIconFilter(f); setIconPage(1); }}>{f}</button>
                            ))}
                        </div>

                        <table className="ap-table">
                            <thead>
                                <tr><th>ID</th><th>미리보기</th><th>아이콘 명칭</th><th>등급</th><th>콘텐츠</th><th>관리</th></tr>
                            </thead>
                            <tbody>
                                {iconList.map(icon => (
                                    <tr key={icon.iconId}>
                                        <td className="ap-text-secondary">{icon.iconId}</td>
                                        <td><img src={icon.iconSrc} alt="preview" className="ap-icon-preview-img" /></td>
                                        <td className="ap-fw-bold">{icon.iconName}</td>
                                        <td><span className={`ap-rarity-badge ${icon.iconRarity.toLowerCase()}`}>{icon.iconRarity}</span></td>
                                        <td>{icon.iconContents}</td>
                                        <td>
                                            <div className="ap-btn-group-sm">
                                                <button className="ap-btn-edit" onClick={() => { setIconForm(icon); setIsIconEdit(true); window.scrollTo(0, 0); }}>수정</button>
                                                <button className="ap-btn-cancel" onClick={() => handleIconDelete(icon.iconId, icon.iconName)}>삭제</button>
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

            {/* 부트스트랩 모달 (클래스명 유지하되 내부 요소 커스텀) */}
            <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content ap-modal-content">
                        <div className="modal-header ap-modal-header">
                            <h5 className="modal-title">콘텐츠 검색</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body ap-modal-body">
                            <div className="ap-search-bar">
                                <input type="text" className="ap-glass-input ap-flex-grow" value={query} placeholder="영화/드라마 제목 검색" onChange={e => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                                <button className="ap-search-btn active" onClick={handleSearch} disabled={isLoading}>검색</button>
                            </div>
                            <div className="ap-status-msg">{statusMessage}</div>
                            <div className="ap-list-group">
                                {resultList.map(result => (
                                    <button key={result.contentsId} className="ap-list-item" onClick={() => handleSelectAndSave(result)}>
                                        <img src={result.posterPath ? `${TMDB_IMAGE_BASE_URL}${result.posterPath}` : ''} alt="" className="ap-list-img" />
                                        <div className="ap-list-info">
                                            <div className="ap-fw-bold">{result.title}</div>
                                            <div className="ap-text-secondary ap-small">{result.type} | {result.releaseDate || "미상"}</div>
                                        </div>
                                        <span className="ap-badge-select">선택</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}