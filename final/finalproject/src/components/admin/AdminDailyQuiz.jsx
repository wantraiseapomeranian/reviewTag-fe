import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPen, FaMagnifyingGlass, FaPlus, FaRotateRight } from "react-icons/fa6"; 
import Swal from "sweetalert2"; // SweetAlert2 추가
import "./AdminDailyQuiz.css"; // 전용 스타일 시트 권장

export default function AdminDailyQuiz() {
    const [quizList, setQuizList] = useState([]);
    
    // 페이징 및 로딩 상태
    const [page, setPage] = useState(1);       
    const [totalPage, setTotalPage] = useState(0); 
    const [loading, setLoading] = useState(false);

    // 검색 관련 상태
    const [searchType, setSearchType] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");

    // 입력 폼 상태
    const [input, setInput] = useState({ quizNo: 0, quizQuestion: "", quizAnswer: "" });
    const [isEditMode, setIsEditMode] = useState(false);

    // 1. 목록 불러오기 (검색어 포함)
    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await axios.get(`/admin/dailyquiz/list`, {
                params: {
                    page: page,
                    type: searchType,
                    keyword: searchKeyword
                }
            });
            setQuizList(resp.data.list || []);       
            setTotalPage(resp.data.totalPage || 0); 
        } catch (e) {
            console.error("퀴즈 로드 실패", e);
            toast.error("목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [page, searchType, searchKeyword]);

    useEffect(() => { loadList(); }, [loadList]);

    // 2. 검색 기능 핸들러
    const handleSearch = () => {
        setPage(1); 
        loadList(); 
    };

    const handleEnter = (e) => {
        if(e.key === 'Enter') handleSearch();
    };

    // 3. 입력값 변경
    const changeInput = (e) => setInput({ ...input, [e.target.name]: e.target.value });

    // 4. 등록 및 수정 (Swal 적용)
    const handleSave = async () => {
        if (!input.quizQuestion.trim() || !input.quizAnswer.trim()) {
            toast.warning("문제와 정답을 모두 입력하세요.");
            return;
        }

        try {
            if (isEditMode) {
                await axios.put("/admin/dailyquiz/", input);
                await Swal.fire({
                    icon: 'success',
                    title: '수정 완료',
                    text: '문제가 성공적으로 업데이트되었습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1a1a1a', color: '#fff'
                });
            } else {
                await axios.post("/admin/dailyquiz/", input);
                await Swal.fire({
                    icon: 'success',
                    title: '등록 완료',
                    text: '새로운 퀴즈가 추가되었습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1a1a1a', color: '#fff'
                });
            }
            handleCancel(); // 폼 초기화
            loadList();
        } catch (e) { 
            Swal.fire("오류", "저장에 실패했습니다.", "error");
        }
    };

    // 5. 삭제 (Swal 적용)
    const handleDelete = async (quizNo) => {
        const result = await Swal.fire({
            title: '퀴즈 삭제',
            text: `${quizNo}번 문제를 정말 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            background: '#1a1a1a', color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/admin/dailyquiz/${quizNo}`);
                toast.success("문제가 삭제되었습니다.");
                loadList();
            } catch (e) { toast.error("삭제 실패"); }
        }
    };

    // 6. UI 핸들러
    const handleEditClick = (quiz) => { 
        setInput({ ...quiz }); 
        setIsEditMode(true); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleCancel = () => { 
        setInput({ quizNo: 0, quizQuestion: "", quizAnswer: "" }); 
        setIsEditMode(false); 
    };

    return (
        <div className="admin-quiz-wrapper">
            <div className="container py-5 text-white">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold">🛠️ 데일리 퀴즈 관리 <span className="text-secondary fs-6">Admin Panel</span></h2>
                    <button className="btn btn-outline-light btn-sm" onClick={() => loadList()}>
                        <FaRotateRight className={loading ? "spin" : ""} /> 새로고침
                    </button>
                </div>

                {/* 1. 입력 폼 (Glass Card) */}
                <div className="glass-card mb-4 p-4 shadow">
                    <h5 className="text-info mb-4">
                        {isEditMode ? <><FaPen /> {input.quizNo}번 문제 수정</> : <><FaPlus /> 신규 문제 등록</>}
                    </h5>
                    <div className="row g-3">
                        <div className="col-md-9">
                            <label className="form-label small text-secondary">문제 내용</label>
                            <input type="text" className="glass-input" placeholder="영화나 애니메이션 관련 문제를 입력하세요" name="quizQuestion" value={input.quizQuestion} onChange={changeInput} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-secondary">정답</label>
                            <input type="text" className="glass-input" placeholder="정답 입력" name="quizAnswer" value={input.quizAnswer} onChange={changeInput} />
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4 gap-2">
                        {isEditMode && <button className="btn btn-glass-secondary" onClick={handleCancel}>취소</button>}
                        <button className={`btn ${isEditMode ? "btn-warning text-dark" : "btn-primary"} px-4 fw-bold`} onClick={handleSave}>
                            {isEditMode ? "수정 완료" : "문제 등록"}
                        </button>
                    </div>
                </div>

                {/* 2. 검색 및 필터 */}
                <div className="search-glass-bar mb-3">
                    <div className="d-flex gap-2">
                        <select className="glass-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                            <option value="all">전체</option>
                            <option value="question">문제</option>
                            <option value="answer">정답</option>
                        </select>
                        <div className="position-relative flex-grow-1">
                            <input type="text" className="glass-input ps-5" placeholder="검색어를 입력하고 Enter를 누르세요" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleEnter} />
                            <FaMagnifyingGlass className="search-icon-pos" />
                        </div>
                        <button className="btn btn-primary px-4" onClick={handleSearch}>검색</button>
                    </div>
                </div>

                {/* 3. 리스트 테이블 */}
                <div className="table-glass-container">
                    <table className="table table-dark admin-quiz-table align-middle">
                        <thead>
                            <tr>
                                <th width="80" className="text-center">No</th>
                                <th>문제 내용</th>
                                <th width="150" className="text-center">정답</th>
                                <th width="120" className="text-center">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizList.length > 0 ? (
                                quizList.map((q) => (
                                    <tr key={q.quizNo}>
                                        <td className="text-center text-secondary">{q.quizNo}</td>
                                        <td className="quiz-q-text">{q.quizQuestion}</td>
                                        <td className="text-center"><span className="badge bg-dark-soft text-warning">{q.quizAnswer}</span></td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn-icon-action edit" title="수정" onClick={() => handleEditClick(q)}><FaPen /></button>
                                                <button className="btn-icon-action delete" title="삭제" onClick={() => handleDelete(q.quizNo)}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">등록된 퀴즈가 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 4. 스마트 페이지네이션 */}
                {totalPage > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <ul className="pagination glass-pagination">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(1)}>&laquo;</button>
                            </li>
                            {(() => {
                                let start = Math.max(1, page - 2);
                                let end = Math.min(totalPage, start + 4);
                                if (end === totalPage) start = Math.max(1, end - 4);
                                const pages = [];
                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages;
                            })().map((p) => (
                                <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                </li>
                            ))}
                            <li className={`page-item ${page === totalPage ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(totalPage)}>&raquo;</button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}