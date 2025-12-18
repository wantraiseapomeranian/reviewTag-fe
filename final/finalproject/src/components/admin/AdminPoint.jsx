import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // ★ [추가] 페이지 이동용 훅
import './AdminPoint.css'; 

export default function AdminPoint() {
    // 페이지 이동을 위한 훅
    const navigate = useNavigate(); 

    // 탭 상태 (POINT: 포인트관리, ICON: 아이콘관리)
    const [activeTab, setActiveTab] = useState("POINT");

    // ================= [TAB 1] 포인트 관리 상태 =================
    const [memberList, setMemberList] = useState([]); 
    const [keyword, setKeyword] = useState(""); 
    const [inputPoints, setInputPoints] = useState({});
    
    // 포인트 페이징
    const [pointPage, setPointPage] = useState(1);
    const [pointTotalPage, setPointTotalPage] = useState(0);
    const [pointTotalCount, setPointTotalCount] = useState(0);

    // 포인트 수정 모드
    const [editModeId, setEditModeId] = useState(null);
    const [editData, setEditData] = useState({ memberNickname: "", memberLevel: "" });

    // (1) 포인트 목록 로드
    const loadMembers = useCallback(async () => {
        try {
            const resp = await axios.get("/admin/point/list", {
                params: { keyword: keyword, page: pointPage, size: 10 }
            });
            setMemberList(resp.data.list);
            setPointTotalPage(resp.data.totalPage);
            setPointTotalCount(resp.data.totalCount);
        } catch (e) { console.error(e); }
    }, [keyword, pointPage]);

    useEffect(() => {
        if(activeTab === "POINT") loadMembers();
    }, [activeTab, pointPage, loadMembers]);

    // (2) 포인트 검색 & 수정 함수들
    const handlePointSearch = () => { setPointPage(1); loadMembers(); };
    
    const handlePointUpdate = async (memberId, mode) => {
        const amountStr = inputPoints[memberId];
        if (!amountStr || isNaN(amountStr)) return toast.warning("숫자를 입력하세요.");
        let amount = parseInt(amountStr);
        if (mode === 'minus') amount = -amount;

        if (!window.confirm(`${memberId}님에게 ${Math.abs(amount)}포인트를 ${mode === 'plus' ? '지급' : '차감'}하시겠습니까?`)) return;

        try {
            await axios.post("/admin/point/update", { memberId, amount });
            toast.success("처리 완료");
            loadMembers();
            setInputPoints({ ...inputPoints, [memberId]: "" });
        } catch (e) { toast.error("에러 발생"); }
    };

    const saveEdit = async (memberId) => {
        try {
            await axios.post("/admin/point/edit", { memberId, ...editData });
            toast.success("수정되었습니다.");
            setEditModeId(null);
            loadMembers();
        } catch (e) { toast.error("수정 실패"); }
    };


    // ================= [TAB 2] 아이콘 관리 상태 =================
    const [iconList, setIconList] = useState([]);
    const [iconFilter, setIconFilter] = useState("ALL");
    const [iconPage, setIconPage] = useState(1);
    const [iconTotalPage, setIconTotalPage] = useState(0);
    const [iconTotalCount, setIconTotalCount] = useState(0);

    const [iconForm, setIconForm] = useState({ iconId: 0, iconName: "", iconRarity: "COMMON", iconCategory: "DEFAULT", iconSrc: "" });
    const [isIconEdit, setIsIconEdit] = useState(false);

    // (1) 아이콘 목록 로드
    const loadIcons = useCallback(async () => {
        try {
            const resp = await axios.get(`/admin/point/icon/list`, {
                params: { page: iconPage, type: iconFilter }
            });
            const data = resp.data;
            if(data.list) {
                setIconList(data.list);
                // VO 구조에 따라 유연하게 처리
                const total = data.totalCount || (data.pageVO ? data.pageVO.totalCount : 0);
                const pages = data.totalPage || (data.pageVO ? Math.ceil(total/10) : 0);
                setIconTotalCount(total);
                setIconTotalPage(pages);
            } else {
                setIconList([]);
            }
        } catch(e) { console.error(e); }
    }, [iconPage, iconFilter]);

    useEffect(() => {
        if(activeTab === "ICON") loadIcons();
    }, [activeTab, iconPage, iconFilter, loadIcons]);

    const handleIconFilter = (type) => { setIconFilter(type); setIconPage(1); };

    const handleIconSubmit = async () => {
        if(!iconForm.iconName || !iconForm.iconSrc) return toast.warning("필수 입력 항목을 확인하세요.");
        try {
            const url = isIconEdit ? "/admin/point/icon/edit" : "/admin/point/icon/add";
            await axios.post(url, iconForm);
            toast.success(isIconEdit ? "수정 완료" : "등록 완료");
            setIsIconEdit(false);
            setIconForm({ iconId: 0, iconName: "", iconRarity: "COMMON", iconCategory: "DEFAULT", iconSrc: "" });
            loadIcons();
        } catch(e) { toast.error("오류 발생"); }
    };

    const handleIconDelete = async (id) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/admin/point/icon/delete/${id}`);
            toast.success("삭제 완료");
            loadIcons();
        } catch(e) { toast.error("삭제 실패"); }
    };

    const startIconEdit = (icon) => {
        setIconForm({ ...icon });
        setIsIconEdit(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    // ====================== 렌더링 (UI) ======================
    return (
        <div className="admin-point-container">
            <div className="container py-5">
                
                {/* 탭 메뉴 */}
                <div className="d-flex justify-content-center mb-5">
                    <div className="btn-group" role="group">
                        <button type="button" 
                            className={`btn px-4 py-2 ${activeTab === 'POINT' ? 'btn-success fw-bold' : 'btn-secondary text-light'}`} 
                            style={activeTab === 'POINT' ? {backgroundColor: '#198754', borderColor: '#198754'} : {backgroundColor: '#6c757d', borderColor: '#6c757d'}}
                            onClick={() => setActiveTab('POINT')}>
                            💰 포인트 & 회원 관리
                        </button>
                        <button type="button" 
                            className={`btn px-4 py-2 ${activeTab === 'ICON' ? 'btn-success fw-bold' : 'btn-secondary text-light'}`}
                            style={activeTab === 'ICON' ? {backgroundColor: '#198754', borderColor: '#198754'} : {backgroundColor: '#6c757d', borderColor: '#6c757d'}}
                            onClick={() => setActiveTab('ICON')}>
                            🎨 아이콘 관리
                        </button>
                        
                        {/* ★ [추가] 포인트 상점 가기 버튼 */}
                        <button type="button" 
                            className="btn btn-outline-light px-4 py-2 fw-bold"
                            onClick={() => navigate('/point/main')}>
                            🏠 상점 가기
                        </button>
                    </div>
                </div>

                {/* [TAB 1] 포인트 관리 */}
                {activeTab === 'POINT' && (
                    <div className="point-section animate__animated animate__fadeIn">
                        <h2 className="text-center fw-bold text-success mb-4">👮‍♂️ 회원 포인트 관리 ({pointTotalCount}명)</h2>

                        {/* 검색창 */}
                        <div className="d-flex justify-content-center mb-4">
                            <div className="input-group" style={{ maxWidth: '500px' }}>
                                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="회원 검색..." 
                                    value={keyword} onChange={(e) => setKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePointSearch()} />
                                <button className="btn btn-success" onClick={handlePointSearch}>검색</button>
                            </div>
                        </div>

                        <div className="table-responsive glass-table-box mb-4">
                            <table className="table table-dark table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr><th>ID</th><th>닉네임</th><th>등급</th><th>포인트</th><th>지급/차감</th><th>관리</th></tr>
                                </thead>
                                <tbody>
                                    {memberList.map((m) => {
                                        const isEditing = editModeId === m.memberId;
                                        return (
                                            <tr key={m.memberId}>
                                                <td className="text-secondary">{m.memberId}</td>
                                                <td>{isEditing ? <input className="form-control form-control-sm text-center" value={editData.memberNickname} onChange={e=>setEditData({...editData, memberNickname:e.target.value})}/> : m.memberNickname}</td>
                                                <td>{isEditing ? <select className="form-select form-select-sm text-center" value={editData.memberLevel} onChange={e=>setEditData({...editData, memberLevel:e.target.value})}><option>일반회원</option><option>우수회원</option><option>VIP</option><option>관리자</option></select> : <span className={`badge ${m.memberLevel==='관리자'?'bg-danger':'bg-secondary'}`}>{m.memberLevel}</span>}</td>
                                                <td className="text-warning">{m.memberPoint.toLocaleString()} P</td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <input type="number" className="form-control form-control-sm" style={{width:'80px'}} placeholder="0" value={inputPoints[m.memberId]||""} onChange={e=>setInputPoints({...inputPoints, [m.memberId]:e.target.value})}/>
                                                        <button className="btn btn-sm btn-outline-success" onClick={()=>handlePointUpdate(m.memberId,'plus')}>+</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={()=>handlePointUpdate(m.memberId,'minus')}>-</button>
                                                    </div>
                                                </td>
                                                <td>
                                                    {isEditing ? <><button className="btn btn-sm btn-primary me-1" onClick={()=>saveEdit(m.memberId)}>저장</button><button className="btn btn-sm btn-secondary" onClick={()=>setEditModeId(null)}>취소</button></> 
                                                    : <button className="btn btn-sm btn-dark border-secondary" onClick={()=>{setEditModeId(m.memberId); setEditData({memberNickname:m.memberNickname, memberLevel:m.memberLevel})}}>수정</button>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex justify-content-center">
                            {pointTotalPage > 1 && Array.from({length:pointTotalPage},(_,i)=>i+1).map(p=>(
                                <button key={p} className={`btn btn-sm mx-1 ${pointPage===p?'btn-success':'btn-outline-secondary'}`} onClick={()=>setPointPage(p)}>{p}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* [TAB 2] 아이콘 관리 */}
                {activeTab === 'ICON' && (
                    <div className="icon-section animate__animated animate__fadeIn">
                        <h2 className="text-center fw-bold text-success mb-4">🎨 아이콘 상점 관리 ({iconTotalCount}개)</h2>

                        <div className="glass-table-box p-4 mb-4">
                            <h5 className="text-white mb-3 border-bottom pb-2">
                                {isIconEdit ? `✏️ 아이콘 수정 (ID: ${iconForm.iconId})` : "➕ 새 아이콘 등록"}
                            </h5>
                            <div className="row g-2">
                                <div className="col-md-3"><label className="small text-muted mb-1">이름</label><input type="text" className="form-control" value={iconForm.iconName} onChange={e=>setIconForm({...iconForm, iconName:e.target.value})} placeholder="예: 황금 사자" /></div>
                                <div className="col-md-2"><label className="small text-muted mb-1">등급</label><select className="form-select" value={iconForm.iconRarity} onChange={e=>setIconForm({...iconForm, iconRarity:e.target.value})}><option>COMMON</option><option>RARE</option><option>EPIC</option><option>UNIQUE</option><option>LEGENDARY</option><option>EVENT</option></select></div>
                                <div className="col-md-5"><label className="small text-muted mb-1">이미지 URL</label><input type="text" className="form-control" value={iconForm.iconSrc} onChange={e=>setIconForm({...iconForm, iconSrc:e.target.value})} placeholder="https://..." /></div>
                                <div className="col-md-2 d-flex align-items-end"><button className={`btn w-100 ${isIconEdit?'btn-success':'btn-primary'}`} onClick={handleIconSubmit}>{isIconEdit ? "수정 완료" : "등록 하기"}</button></div>
                            </div>
                            {isIconEdit && <button className="btn btn-sm btn-secondary mt-2 w-100" onClick={()=>{setIsIconEdit(false); setIconForm({iconId:0, iconName:"", iconRarity:"COMMON", iconCategory:"DEFAULT", iconSrc:""})}}>수정 취소</button>}
                        </div>

                        <div className="d-flex gap-2 mb-3 overflow-auto">
                            {['ALL', 'COMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY', 'EVENT'].map(type => (
                                <button key={type} className={`btn btn-sm rounded-pill px-3 ${iconFilter===type?'btn-light text-dark fw-bold':'btn-outline-secondary'}`} onClick={()=>handleIconFilter(type)}>{type}</button>
                            ))}
                        </div>

                        <div className="table-responsive glass-table-box mb-4">
                            <table className="table table-dark table-hover mb-0 text-center align-middle">
                                <thead><tr><th>ID</th><th>미리보기</th><th>이름</th><th>등급</th><th>관리</th></tr></thead>
                                <tbody>
                                    {iconList.length > 0 ? iconList.map(icon => (
                                        <tr key={icon.iconId}>
                                            <td className="text-secondary">{icon.iconId}</td>
                                            <td><img src={icon.iconSrc} alt="icon" width="40" height="40" className="rounded bg-white p-1" /></td>
                                            <td className="fw-bold">{icon.iconName}</td>
                                            <td><span className={`badge ${icon.iconRarity==='LEGENDARY'?'bg-warning text-dark':icon.iconRarity==='UNIQUE'?'bg-purple text-white':icon.iconRarity==='EPIC'?'bg-danger':icon.iconRarity==='RARE'?'bg-primary':'bg-secondary'}`}>{icon.iconRarity}</span></td>
                                            <td><button className="btn btn-sm btn-outline-info me-1" onClick={()=>startIconEdit(icon)}>수정</button><button className="btn btn-sm btn-outline-danger" onClick={()=>handleIconDelete(icon.iconId)}>삭제</button></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="py-4 text-muted">등록된 아이콘이 없습니다.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex justify-content-center">
                            {iconTotalPage > 1 && Array.from({length:iconTotalPage},(_,i)=>i+1).map(p=>(
                                <button key={p} className={`btn btn-sm mx-1 ${iconPage===p?'btn-success':'btn-outline-secondary'}`} onClick={()=>setIconPage(p)}>{p}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}