import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPen, FaMagnifyingGlass } from "react-icons/fa6"; 

export default function AdminDailyQuiz() {
    const [quizList, setQuizList] = useState([]);
    
    // 페이징 관련 상태
    const [page, setPage] = useState(1);       
    const [totalPage, setTotalPage] = useState(0); 

    // 검색 관련 상태
    const [searchType, setSearchType] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");

    // 입력 폼 상태
    const [input, setInput] = useState({ quizNo: 0, quizQuestion: "", quizAnswer: "" });
    const [isEditMode, setIsEditMode] = useState(false);

    // 1. 목록 불러오기
    const loadList = useCallback(async () => {
        try {
            // [체크] 백엔드 경로: /admin/dailyquiz/list 와 일치함
            const resp = await axios.get(`/admin/dailyquiz/list?page=${page}&type=${searchType}&keyword=${searchKeyword}`);
            setQuizList(resp.data.list);       
            setTotalPage(resp.data.totalPage); 
        } catch (e) {
            console.error(e);
            toast.error("목록을 불러오지 못했습니다.");
        }
    }, [page]); // 검색어 변경 시 자동 실행 안 함 (버튼 클릭 시 실행)

    useEffect(() => { loadList(); }, [loadList]);

    // 2. 검색 기능
    const handleSearch = () => {
        setPage(1); 
        loadList(); 
    };

    const handleEnter = (e) => {
        if(e.key === 'Enter') handleSearch();
    };

    // 3. 입력값 변경
    const changeInput = (e) => setInput({ ...input, [e.target.name]: e.target.value });

    // 4. 등록 및 수정
    const handleSave = async () => {
        if (!input.quizQuestion || !input.quizAnswer) {
            toast.warning("문제와 정답을 모두 입력하세요.");
            return;
        }
        try {
            if (isEditMode) {
                // [체크] 백엔드 경로: /admin/dailyquiz/ 와 일치함
                await axios.put("/admin/dailyquiz/", input);
                toast.success("수정되었습니다.");
            } else {
                await axios.post("/admin/dailyquiz/", input);
                toast.success("등록되었습니다.");
            }
            setInput({ quizNo: 0, quizQuestion: "", quizAnswer: "" });
            setIsEditMode(false);
            loadList();
        } catch (e) { toast.error("저장 실패"); }
    };

    // 5. 삭제
    const handleDelete = async (quizNo) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            // [수정 완료] 기존 /admin/quiz -> /admin/dailyquiz 로 변경
            await axios.delete(`/admin/dailyquiz/${quizNo}`);
            toast.success("삭제되었습니다.");
            loadList();
        } catch (e) { toast.error("삭제 실패"); }
    };

    // 6. UI 핸들러
    const handleEditClick = (quiz) => { 
        setInput({ ...quiz }); 
        setIsEditMode(true); 
        window.scrollTo(0,0); 
    };

    const handleCancel = () => { 
        setInput({ quizNo: 0, quizQuestion: "", quizAnswer: "" }); 
        setIsEditMode(false); 
    };

    return (
        <div className="container mt-5 text-white">
            <h2 className="mb-4 fw-bold">🛠️ 데일리 퀴즈 관리자</h2>

            {/* 검색창 영역 */}
            <div className="d-flex justify-content-end mb-3">
                <div className="input-group" style={{ maxWidth: '400px' }}>
                    <select 
                        className="form-select bg-dark text-white border-secondary" 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        style={{ maxWidth: '100px' }}
                    >
                        <option value="all">전체</option>
                        <option value="question">문제</option>
                        <option value="answer">정답</option>
                    </select>
                    <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        placeholder="검색어 입력"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={handleEnter}
                    />
                    <button className="btn btn-secondary" onClick={handleSearch}>
                        <FaMagnifyingGlass />
                    </button>
                </div>
            </div>

            {/* 입력 폼 */}
            <div className="card bg-dark border-secondary mb-4 p-3">
                <h5 className="text-light mb-3">{isEditMode ? `✏️ ${input.quizNo}번 문제 수정` : "➕ 새 문제 등록"}</h5>
                <div className="row g-2">
                    <div className="col-md-8">
                        <input type="text" className="form-control bg-secondary text-white border-0" placeholder="문제 내용을 입력하세요" name="quizQuestion" value={input.quizQuestion} onChange={changeInput} />
                    </div>
                    <div className="col-md-4">
                        <input type="text" className="form-control bg-secondary text-white border-0" placeholder="정답" name="quizAnswer" value={input.quizAnswer} onChange={changeInput} />
                    </div>
                </div>
                <div className="d-flex justify-content-end mt-3 gap-2">
                    {isEditMode && <button className="btn btn-secondary" onClick={handleCancel}>취소</button>}
                    <button className={`btn ${isEditMode ? "btn-warning" : "btn-primary"}`} onClick={handleSave}>{isEditMode ? "수정 완료" : "등록하기"}</button>
                </div>
            </div>

            {/* 리스트 테이블 */}
            <div className="table-responsive">
                <table className="table table-dark table-hover table-bordered text-center align-middle">
                    <thead className="table-secondary">
                        <tr>
                            <th width="10%">No</th>
                            <th width="60%">문제</th>
                            <th width="15%">정답</th>
                            <th width="15%">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizList.map((q) => (
                            <tr key={q.quizNo}>
                                <td>{q.quizNo}</td>
                                <td className="text-start px-3">{q.quizQuestion}</td>
                                <td className="text-warning fw-bold">{q.quizAnswer}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditClick(q)}><FaPen /></button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(q.quizNo)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 스마트 페이지네이션 */}
            {totalPage > 0 && (
                <div className="d-flex justify-content-center mt-4 pb-5">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link bg-dark text-white border-secondary" onClick={() => setPage(1)}>&laquo;&laquo;</button>
                            </li>
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link bg-dark text-white border-secondary" onClick={() => setPage(p => Math.max(1, p - 1))}>&laquo;</button>
                            </li>

                            {(() => {
                                let start = page - 2;
                                let end = page + 2;
                                if (start < 1) { end += (1 - start); start = 1; }
                                if (end > totalPage) { start -= (end - totalPage); end = totalPage; }
                                start = Math.max(1, start);

                                const pages = [];
                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages;
                            })().map((p) => (
                                <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                    <button 
                                        className={`page-link border-secondary ${page === p ? 'bg-danger text-white border-danger fw-bold' : 'bg-dark text-white'}`} 
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${page === totalPage ? 'disabled' : ''}`}>
                                <button className="page-link bg-dark text-white border-secondary" onClick={() => setPage(p => Math.min(totalPage, p + 1))}>&raquo;</button>
                            </li>
                            <li className={`page-item ${page === totalPage ? 'disabled' : ''}`}>
                                <button className="page-link bg-dark text-white border-secondary" onClick={() => setPage(totalPage)}>&raquo;&raquo;</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
}