import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function IconAdmin() {
    // 초기값을 빈 배열로 확실하게 설정
    const [icons, setIcons] = useState([]);
    
    // 페이지네이션 & 필터 상태
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [filterType, setFilterType] = useState("ALL"); 

    // 입력 폼
    const [form, setForm] = useState({ 
        iconId: 0, 
        iconName: "", 
        iconRarity: "COMMON", 
        iconCategory: "DEFAULT", 
        iconSrc: "" 
    });
    const [isEdit, setIsEdit] = useState(false);

    // ★ [핵심] 안전한 목록 불러오기 로직
    const loadIcons = useCallback(async () => {
        try {
            const resp = await axios.get(`/point/icon/admin/list?page=${page}&type=${filterType}`);
            const data = resp.data; 
            
            // 데이터 구조 확인 (배열인지, VO인지)
            if (data && data.list) {
                // 정상적으로 VO가 왔을 때
                setIcons(data.list);
                setTotalPage(data.totalPage || 0);
                setTotalCount(data.totalCount || 0);
            } else if (Array.isArray(data)) {
                // 혹시 옛날 방식(List)으로 왔을 때 (에러 방지용)
                setIcons(data);
                setTotalPage(1);
                setTotalCount(data.length);
            } else {
                // 데이터가 이상할 때 빈 배열 처리
                setIcons([]); 
            }
        } catch(e) { 
            console.error(e);
            setIcons([]); // 에러나면 빈 화면 보여주기
        }
    }, [page, filterType]);

    useEffect(() => { loadIcons(); }, [loadIcons]);

    const handleFilterChange = (type) => { setFilterType(type); setPage(1); };

    const handleSubmit = async () => {
        if(!form.iconName || !form.iconSrc) return toast.warning("정보를 입력하세요.");
        try {
            const url = isEdit ? "/point/icon/admin/edit" : "/point/icon/admin/add";
            await axios.post(url, form);
            toast.success(isEdit ? "수정 완료" : "등록 완료");
            setForm({ iconId: 0, iconName: "", iconRarity: "COMMON", iconCategory: "DEFAULT", iconSrc: "" });
            setIsEdit(false);
            loadIcons();
        } catch(e) { toast.error("오류 발생"); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/point/icon/admin/delete/${id}`);
            toast.success("삭제 완료");
            loadIcons();
        } catch(e) { toast.error("실패"); }
    };

    const handleEditClick = (icon) => {
        setForm({ ...icon });
        setIsEdit(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 페이지네이션
    const renderPagination = () => {
        if (totalPage <= 1) return null; // 페이지가 1개면 숨김
        const pageGroupSize = 10;
        const currentGroup = Math.ceil(page / pageGroupSize); 
        const startPage = (currentGroup - 1) * pageGroupSize + 1;
        const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                <button className="btn btn-sm btn-light border" onClick={() => setPage(startPage - 1)} disabled={startPage === 1}>&lt;</button>
                {pages.map(p => (
                    <button key={p} className={`btn btn-sm fw-bold ${p === page ? 'btn-primary' : 'btn-light border'}`} onClick={() => setPage(p)} style={{width: '32px'}}>{p}</button>
                ))}
                <button className="btn btn-sm btn-light border" onClick={() => setPage(endPage + 1)} disabled={endPage === totalPage}>&gt;</button>
            </div>
        );
    };

    return (
        <div className="container py-4">
            <h4 className="fw-bold mb-3">🎨 아이콘 관리자 <span className="fs-6 text-muted">({totalCount}개)</span></h4>
            
            {/* 입력 폼 */}
            <div className="card p-3 mb-4 bg-light shadow-sm border-0">
                <div className="row g-2">
                    <div className="col-md-3">
                        <label className="small text-muted">이름</label>
                        <input type="text" className="form-control" value={form.iconName} onChange={e=>setForm({...form, iconName:e.target.value})} />
                    </div>
                    <div className="col-md-2">
                        <label className="small text-muted">등급</label>
                        <select className="form-select" value={form.iconRarity} onChange={e=>setForm({...form, iconRarity:e.target.value})}>
                            <option value="COMMON">COMMON</option>
                            <option value="RARE">RARE</option>
                            <option value="EPIC">EPIC</option>
                            <option value="UNIQUE">UNIQUE</option>
                            <option value="LEGENDARY">LEGENDARY</option>
                            <option value="EVENT">EVENT</option>
                        </select>
                    </div>
                    <div className="col-md-5">
                        <label className="small text-muted">이미지 경로</label>
                        <input type="text" className="form-control" value={form.iconSrc} onChange={e=>setForm({...form, iconSrc:e.target.value})} />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button className={`btn w-100 ${isEdit?'btn-success':'btn-primary'}`} onClick={handleSubmit}>
                            {isEdit ? "수정 저장" : "신규 등록"}
                        </button>
                        {isEdit && <button className="btn btn-secondary w-100 ms-1" onClick={()=>{setIsEdit(false); setForm({iconId:0, iconName:"", iconRarity:"COMMON", iconCategory:"DEFAULT", iconSrc:""})}}>취소</button>}
                    </div>
                </div>
            </div>

            {/* 필터 버튼 */}
            <div className="d-flex gap-2 mb-3 overflow-auto pb-2">
                {['ALL', 'COMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY', 'EVENT'].map(type => (
                    <button 
                        key={type}
                        className={`btn btn-sm rounded-pill px-3 ${filterType === type ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => handleFilterChange(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* 목록 테이블 */}
            <div className="table-responsive">
                <table className="table table-hover text-center align-middle border">
                    <thead className="table-dark">
                        <tr><th>ID</th><th>이미지</th><th>이름</th><th>등급</th><th>관리</th></tr>
                    </thead>
                    <tbody>
                        {/* ★ [핵심] icons가 null/undefined면 렌더링 안 함 */}
                        {!icons || icons.length === 0 ? (
                            <tr><td colSpan="5" className="py-4">데이터가 없습니다.</td></tr>
                        ) : (
                            icons.map(icon => (
                                <tr key={icon.iconId}>
                                    <td>{icon.iconId}</td>
                                    <td>
                                        <img src={icon.iconSrc} width="40" height="40" className="rounded bg-white border" alt="" onError={(e)=>{e.target.src='https://placehold.co/40?text=X'}}/>
                                    </td>
                                    <td className="fw-bold">{icon.iconName}</td>
                                    <td>
                                        <span className={`badge ${
                                            icon.iconRarity==='LEGENDARY'?'bg-warning text-dark border border-dark':
                                            icon.iconRarity==='UNIQUE'?'bg-purple text-white':
                                            icon.iconRarity==='EPIC'?'bg-danger':
                                            icon.iconRarity==='RARE'?'bg-primary':
                                            icon.iconRarity==='EVENT'?'bg-event':
                                            'bg-secondary'
                                        }`}>{icon.iconRarity}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>handleEditClick(icon)}>수정</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(icon.iconId)}>삭제</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );
}