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
    //검색어 state
    const [query, setQuery] = useState("");
    //검색결과 state
    const [resultList, setResultList] = useState([]);
    //사용자가 선택한 영화 정보 state
    const [contentsDetail, setContentsDetail] = useState({contentsId: null, contentsTitle: ""});
    //영화를 선택했는지 안했는지 여부를 저장하는 state
    const [isSelect, setIsSelect] = useState(false);
    //영화 로딩 상태 state
    const [isLoading, setIsLoading] = useState(false);
    //상태 메세지 state
    const [statusMessage, setStatusMessage] = useState("");
    //모달용 도구
        const modal = useRef();
        const quillRef = useRef(null);
    
        const openModal = useCallback(() => {
            const instance = Modal.getOrCreateInstance(modal.current);
            instance.show();
        }, [modal]);
        const closeModal = useCallback(() => {
            const instance = Modal.getInstance(modal.current);
            instance.hide();
        }, [modal]);
        const clearAndCloseModal = useCallback(() => {
            closeModal();
            setTimeout(() => { clearData(); }, 100);
        }, [modal]);

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
    const [iconForm, setIconForm] = useState({ iconId: 0, iconName: "", iconCategory : "DEFAULT",iconRarity: "COMMON", iconSrc: "", iconContents:"" });
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
            setIconForm({ iconId: 0, iconName: "", iconCategory : "DEFAULT", iconRarity: "COMMON", iconSrc: "" });
            setContentsDetail({contentsId: null, contentsTitle: ""});
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

    
       //[검색 실행 statusMessage 제어]
    const handleSearch = useCallback(async () => {
        if (query.trim().length === 0) {
            setResultList([]);
            return;
        }
        setResultList([]);

        try {
            const response = await axios.get("/api/tmdb/search", { params: { query } });
            //검색결과 리스트 state에 저장
            setResultList(response.data);
        }
        catch (error) {
            console.error("오류발생 : ", error);
            setStatusMessage("검색 중 서버 오류 발생");
        }

    }, [query]);

        // [컨텐츠 선택 및 DB저장]
    const handleSelectAndSave = useCallback(async (contents) => {
        setIsLoading(true);
        setIsSelect(true);//리스트 숨김을 위해 state 변경

        try {
            //데이터 restController로 전송
            const response = await axios.post("/api/tmdb/save", {
                contentsId: contents.contentsId,
                type: contents.type
            });

            //응답 데이터 상세정보 업데이트
            setContentsDetail(response.data);
            setIsSelect(true);
            setIconForm(prev => ({ ...prev, iconContents: contents.contentsId }));
            console.log(iconForm);
        }
        catch (error) {
            console.error("저장 API 오류 : ", error);
            setIsSelect(false); //저장 실패 시 리스트를 다시 보여주기 위한 처리 
        }
        finally {
            setIsLoading(false);
            closeModal();
        }
    }, [iconForm, isSelect, isLoading]);

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

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
                            {/*  컨텐츠 선택  */}
                            <div className="row mt-1">
                                <div className="col">
                                    <div className="input-group text-nowarp" onClick={openModal} style={{ cursor: "pointer" }}>
                                        <input type="text"
                                            className={"glass-input form-control"}
                                            value={contentsDetail.contentsTitle || ""} // 선택된 영화 제목 표시
                                            placeholder="관련 컨텐츠"
                                            readOnly
                                            style={{ cursor: "pointer" }}
                                        />
                                        <input type="hidden" readOnly name="iconContents" value={contentsDetail.contentsId || ""} />
                                        {/* 선택된 컨텐츠가 있으면 뱃지 표시 */}
                                        {contentsDetail.contentsId && (
                                            <span className="input-group-text bg-success text-white">선택됨</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mb-3 mt-2">
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
                                <tr><th>ID</th><th>미리보기</th><th>아이콘 명칭</th><th>등급</th><th>콘텐츠</th><th>관리</th></tr>
                            </thead>
                            <tbody>
                                {iconList.map(icon => (
                                    <tr key={icon.iconId}>
                                        <td className="text-secondary">{icon.iconId}</td>
                                        <td><img src={icon.iconSrc} alt="preview" className="icon-preview-img" /></td>
                                        <td className="fw-bold">{icon.iconName}</td>
                                        <td><span className={`rarity-badge ${icon.iconRarity.toLowerCase()}`}>{icon.iconRarity}</span></td>
                                        <td>{icon.iconContents}</td>
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
                        {/* 모달(Modal) */}
            <div className="modal fade" tabIndex="-1" data-bs-backdrop="static" ref={modal} data-bs-keyboard="false">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">컨텐츠 검색</h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            {/* 검색창 */}
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" value={query}
                                    placeholder="영화/드라마 제목 검색"
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                />
                                <button className="btn btn-success" onClick={handleSearch} disabled={isLoading}>
                                    검색
                                </button>
                            </div>

                            {/* 상태 메시지 */}
                            <div className="mb-3 text-secondary small">
                                {statusMessage}
                            </div>

                            {/* 검색 결과 목록 */}
                            <div className="list-group">
                                {resultList.map(result => (
                                    <button key={result.contentsId}
                                        className="list-group-item list-group-item-action d-flex align-items-center p-2"
                                        onClick={() => handleSelectAndSave(result)}>

                                        <img src={getPosterUrl(result.posterPath)}
                                            alt={result.title}
                                            className="rounded me-3"
                                            style={{ width: "50px", height: "75px", objectFit: "cover" }} />

                                        <div className="flex-fill">
                                            <div className="fw-bold">{result.title}</div>
                                            <div className="text-muted small">
                                                {result.type} | {result.releaseDate || "날짜 미상"}
                                            </div>
                                        </div>
                                        <div className="ms-2">
                                            <span className="badge bg-primary rounded-pill">선택</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}