import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AdminPoint.css'; 
import { Modal } from 'bootstrap';

export default function AdminPoint() {
    const navigate = useNavigate(); 

    const [activeTab, setActiveTab] = useState("POINT");
    const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    
    // 모달 Refs
    const movieModal = useRef();
    const historyModal = useRef();

    // [공통] 모달 제어 함수
    const openModal = (ref) => {
        const instance = Modal.getOrCreateInstance(ref.current);
        instance.show();
    };
    const closeModal = (ref) => {
        const instance = Modal.getInstance(ref.current);
        if (instance) instance.hide();
    };

    // [TAB 1] 포인트 및 회원 관리 상태
    const [memberList, setMemberList] = useState([]); 
    const [keyword, setKeyword] = useState(""); 
    const [inputPoints, setInputPoints] = useState({});
    const [pointPage, setPointPage] = useState(1);
    const [pointTotalPage, setPointTotalPage] = useState(0);
    const [editModeId, setEditModeId] = useState(null);
    const [editData, setEditData] = useState({ memberNickname: "", memberLevel: "" });

    // [신규] 포인트 히스토리 상태
    const [historyList, setHistoryList] = useState([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPage, setHistoryTotalPage] = useState(0);
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    // [TAB 2] 아이콘 관리 상태
    const [iconList, setIconList] = useState([]);
    const [iconFilter, setIconFilter] = useState("ALL");
    const [iconPage, setIconPage] = useState(1);
    const [iconTotalPage, setIconTotalPage] = useState(0);
    const [iconForm, setIconForm] = useState({ iconId: 0, iconName: "", iconCategory : "DEFAULT", iconRarity: "COMMON", iconSrc: "", iconContents:"" });
    const [isIconEdit, setIsIconEdit] = useState(false);
    const [query, setQuery] = useState("");
    const [resultList, setResultList] = useState([]);
    const [contentsDetail, setContentsDetail] = useState({contentsId: null, contentsTitle: ""});

    // 데이터 로드: 회원 목록
    const loadMembers = useCallback(async () => {
        try {
            const resp = await axios.get("/admin/point/list", {
                params: { keyword: keyword, page: pointPage, size: 10 }
            });
            setMemberList(resp.data.list || []);
            setPointTotalPage(resp.data.totalPage || 0);
        } catch (e) { toast.error("목록 로드 실패"); }
    }, [keyword, pointPage]);

    // [신규] 데이터 로드: 특정 회원 히스토리
    const loadHistory = useCallback(async (memberId, page = 1) => {
        try {
            const resp = await axios.get(`/admin/point/history/${memberId}`, {
                params: { page: page, size: 10 }
            });
            setHistoryList(resp.data.list || []);
            setHistoryTotalPage(resp.data.totalPage || 0);
            setHistoryPage(page);
            setSelectedMemberId(memberId);
            openModal(historyModal);
        } catch (e) { toast.error("내역 로드 실패"); }
    }, []);

    useEffect(() => {
        if(activeTab === "POINT") loadMembers();
    }, [activeTab, pointPage, loadMembers]);

    // 포인트 업데이트 및 수정 로직 (생략 - 기존과 동일)
    const handlePointUpdate = async (memberId, mode) => { /* 기존 코드 */ };
    const saveEdit = async (memberId) => { /* 기존 코드 */ };

    // 아이콘 관련 로직 (생략 - 기존과 동일)
    const loadIcons = useCallback(async () => { /* 기존 코드 */ }, [iconPage, iconFilter]);
    const handleIconSubmit = async () => { /* 기존 코드 */ };

    // 공통 페이지네이션 렌더러
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

    return (
        <div className="ap-container">
            <div className="ap-max-width">
                <div className="ap-header-flex">
                    <h2 className="ap-title">🛡️ 시스템 관리자 모드</h2>
                    <div className="ap-tab-group">
                        <button className={`ap-tab-item ${activeTab === 'POINT' ? 'active' : ''}`} onClick={() => setActiveTab('POINT')}>💰 포인트/회원</button>
                        <button className={`ap-tab-item ${activeTab === 'ICON' ? 'active' : ''}`} onClick={() => setActiveTab('ICON')}>🎨 아이콘 DB</button>
                    </div>
                </div>

                {activeTab === 'POINT' && (
                    <div className="ap-content-card">
                        <div className="ap-search-bar">
                            <input type="text" className="ap-glass-input" placeholder="ID/닉네임 검색..." value={keyword} onChange={e => setKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && loadMembers()} />
                            <button className="ap-search-btn" onClick={loadMembers}>조회</button>
                        </div>
                        <table className="ap-table">
                            <thead>
                                <tr><th>회원정보(ID클릭)</th><th>등급</th><th>보유포인트</th><th>조절</th><th>작업</th></tr>
                            </thead>
                            <tbody>
                                {memberList.map((m) => {
                                    const isEditing = editModeId === m.memberId;
                                    return (
                                        <tr key={m.memberId}>
                                            <td className="ap-text-left">
                                                <div className="ap-id-txt ap-clickable-id" onClick={() => loadHistory(m.memberId, 1)}>
                                                    {m.memberId} 🔍
                                                </div>
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
                {/* ICON 탭 영역 (기존과 동일) */}
            </div>

            {/* [MODAL 1] 히스토리 상세 내역 */}
          <div className="modal fade" tabIndex="-1" ref={historyModal}>
    <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content ap-modal-content">
            <div className="modal-header ap-modal-header">
                <h5 className="modal-title">
                    💎 <span className="ap-text-highlight">{selectedMemberId}</span> 님의 상세 내역
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => closeModal(historyModal)}></button>
            </div>
            <div className="modal-body ap-modal-body">
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th style={{width: '30%'}}>일시</th>
                            <th style={{width: '45%'}}>내용</th>
                            <th style={{width: '25%'}}>변동금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyList.length > 0 ? (
                            historyList.map((h) => (
                                <tr key={h.pointHistoryId}>
                                    {/* DTO의 pointHistoryCreatedAt 사용 */}
                                    <td className="ap-small">{h.pointHistoryCreatedAt}</td>
                                    {/* DTO의 pointHistoryReason 사용 */}
                                    <td className="ap-text-left">{h.pointHistoryReason}</td>
                                    <td className={h.pointHistoryAmount > 0 ? "ap-text-plus" : "ap-text-minus"}>
                                        {h.pointHistoryAmount > 0 ? `+${h.pointHistoryAmount}` : h.pointHistoryAmount} P
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{padding: '40px', textAlign: 'center'}}>
                                    조회된 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* 페이지네이션 */}
                <div className="ap-mt-2">
                    {renderPagination(historyPage, historyTotalPage, (p) => loadHistory(selectedMemberId, p))}
                </div>
            </div>
            <div className="modal-footer" style={{borderTop: '1px solid #30363d'}}>
                <button type="button" className="ap-btn-main" onClick={() => closeModal(historyModal)}>닫기</button>
            </div>
        </div>
    </div>
</div>
            
            {/* [MODAL 2] 콘텐츠 검색 (기존 유지) */}
        </div>
    );
}