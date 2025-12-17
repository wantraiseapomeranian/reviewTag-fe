import axios from "axios";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react"
import { FaComment, FaPen, FaRegEye, FaRegThumbsDown, FaRegThumbsUp, FaTrashAlt } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
import { loginIdState } from "../../utils/jotai";
import { cleanExpiredViews } from '../../utils/localStorage/cleanStorage';


export default function BoardDetail() {

    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);

    const navigate = useNavigate();
    const { boardNo } = useParams();

    //state
    const [board, setBoard] = useState({
        boardNo: null, boardTitle: "", boardContentsId: null,
        boardWtime: "", boardEtime: "", boardText: "",
        boardLike: 0, boardUnlike: 0, boardReplyCount: 0,
        boardNotice: "", boardViewCount: 0
    });
    const [contentsTitle, setContentsTitle] = useState("");

    const [boardResponseVO, setBoardResponseVO] = useState({
        response: false, responseType: "", likeCount: 0, unlikeCount: 0
    });

    const [reply, setReply] = useState({
        replyNo: null, replyTarget: null, replyWriter: "",
        replyContent: "", replyEtime: "", replyWtime: ""
    });

    const [replyList, setReplyList] = useState([]);

    const [editReplyNo, setEditReplyNo] = useState(null); // 현재 수정 중인 댓글 번호
    const [editContent, setEditContent] = useState("");   // 수정 중인 내용


    // effect
    useEffect(() => {
        loadData();
        loadReply();
    }, [boardNo]);


    useEffect(() => {
        if (board.boardContentsId) {
            loadTitle(board.boardContentsId);
        }
    }, [board.boardContentsId]);

    useEffect(() => {
        checkResponse();
    }, [loginId, boardNo]);


    // 조회수 : 로컬 스토리지에서 검사 + 증가 요청
    const viewTimeLimit = 30 * 60 * 1000 ; // 30분
    const checkView = useCallback(async()=>{
        if(!loginId) return;
        const key = `view_${loginId}_${boardNo}`;
        const now = Date.now();

        const stored = localStorage.getItem(key);
        const viewed = stored ? JSON.parse(stored) : null;

        // 값이 없거나 30분이 지났다면
        if(!viewed||now-viewed.time > viewTimeLimit){
            localStorage.setItem(key,JSON.stringify({ time: now })); // 로컬스토리지 key저장
            //조회 수 증가 요청
            try{const response = await axios.post(`/board/viewUpdate/${boardNo}`);}
            catch(e){console.log("조회 수 증가 실패")};
        };
    },[loginId, boardNo])
    
     // 조회수 증가요청 실행
    useEffect(()=>{
        checkView();
        cleanExpiredViews(); // 로컬 스토리지에서 만료된 키 제거
    },[checkView])

    // callback
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setReply(prev => ({ ...prev, [name]: value }))
    }, [])

    //[댓글 목록 조회]
    const loadReply = useCallback(async () => {
        if (!boardNo) return;
        try {
            const dataToSend = {
                loginId: loginId,
                boardNo: boardNo
            };
            const { data } = await axios.post("/reply/", null, { params: dataToSend });
            setReplyList(data);
        }
        catch (err) {
            console.error("댓글 목록 조회 실패", err);
        }
    }, [boardNo, loginId]);

    //[게시글 상세 정보 조회]
    const loadData = useCallback(async () => {
        try {
            const { data } = await axios.get(`/board/${boardNo}`);
            setBoard(data);
        }
        catch (err) {
            console.error("게시글 상세 로드 실패: ", err);
        }
    }, [boardNo]);

    //[컨텐츠 제목 조회]
    const loadTitle = useCallback(async (id) => {
        if (!id) return;
        try {
            const { data } = await axios.get(`/api/tmdb/title/${id}`);
            setContentsTitle(data);
        }
        catch (err) {
            console.error("컨텐츠 제목 로드 실패: ", err);
        }
    }, []);

    //[좋아요 싫어요 여부 조회]
    const checkResponse = useCallback(async () => {
        if (loginId === "") return;

        try {
            const { data } = await axios.post("/board/check", null,
                { params: { loginId: loginId, boardNo: boardNo } });
            setBoardResponseVO(data);
        }
        catch (err) {
            console.error("[checkResponse] 실패 : ", err);
        }

    }, [boardNo, loginId]);

    //[좋아요 등록 / 삭제]
    const changeLike = useCallback(async (e) => {
        if (loginId === "") {
            toast.error("로그인이 필요한 기능입니다");
            return;
        }
        const boardResponseDto = {
            memberId: loginId,
            boardNo: boardNo,
            responseType: "좋아요"
        }

        try {
            const { data } = await axios.post("/board/action", boardResponseDto);
            setBoardResponseVO(data);
            console.log("좋아요 등록 삭제 성공");

        }
        catch (err) {
            console.error("좋아요 등록 삭제 실패 : ", err);
        }


    }, [loginId, boardNo, boardResponseVO]);


    //[좋아요 등록 / 삭제]
    const changeUnlike = useCallback(async (e) => {
        if (loginId === "") {
            toast.error("로그인이 필요한 기능입니다");
            return;
        }
        const boardResponseDto = {
            memberId: loginId,
            boardNo: boardNo,
            responseType: "싫어요"
        }

        try {
            const { data } = await axios.post("/board/action", boardResponseDto);
            setBoardResponseVO(data);
            console.log("싫어요 등록 삭제 성공");

        }
        catch (err) {
            console.error("좋아요 등록 삭제 실패 : ", err);
        }


    }, [loginId, boardNo, boardResponseVO]);

    //[댓글 등록]
    const sendData = useCallback(async () => {
        if (!loginId) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        if (!reply.replyContent || reply.replyContent.trim().length === 0) {
            toast.error("내용을 입력해주세요.");
            return;
        }

        // 기존 state(reply)에 작성자와 타겟 번호를 합침
        const dataToSend = {
            ...reply,
            replyTarget: boardNo,
            replyWriter: loginId
        };

        try {
            await axios.post("/reply/write", dataToSend);

            // 성공 후 입력창 초기화 
            setReply(prev => ({ ...prev, replyContent: "" }));

            // 댓글 목록과 댓글 수 최신화
            loadReply();
            loadData();

        } catch (err) {
            console.error("댓글 등록 실패: ", err);
        }

    }, [reply, boardNo, loginId]);

    //[댓글 삭제]
    const deleteReply = useCallback(async (no) => {
        try {
            await axios.delete(`/reply/${no}`)
            loadData();
            loadReply();
        }
        catch (err) {
            console.error("댓글 삭제 실패: ", err);
        }
    }, [loadData, loadReply]);

    //[댓글 수정]
    //수정 모드 시작
    const startEdit = useCallback((replyDto) => {
        setEditReplyNo(replyDto.replyNo);
        setEditContent(replyDto.replyContent); // 기존 내용을 입력창에 채움
    }, []);

    //수정 취소
    const cancelEdit = useCallback(() => {
        setEditReplyNo(null);
        setEditContent("");
    }, []);

    //댓글 수정 요청 
    const updateReply = useCallback(async () => {
        if (!editContent || editContent.trim().length === 0) {
            toast.error("내용을 입력해주세요.");
            return;
        }

        try {
            await axios.put(`/reply/${editReplyNo}`, null, {params: { editContent: editContent }});

            toast.success("댓글이 수정되었습니다.");
            setEditReplyNo(null); // 수정 모드 종료
            loadReply(); // 목록 갱신
        } catch (err) {
            console.error("댓글 수정 실패: ", err);
            toast.error("댓글 수정에 실패했습니다.");
        }
    }, [editReplyNo, editContent, loadReply]);

    const deleteBoard = useCallback(async () => {
        const choice = window.confirm("게시글을 삭제하시겠습니까?");
        if (choice === false) return;
        try {
            await axios.delete(`/board/boardNo/${boardNo}`);
            console.log("삭제 완료");
            toast.success("게시글이 삭제되었습니다");
            navigate("/board/list");
        }
        catch (err) {
            toast.error("삭제 실패")
            return;
        }
    }, [])

    // [날짜 포맷팅 함수] 
    const getDisplayDate = (dateString) => {
        if (!dateString) return ""; // 데이터가 로딩 전이면 빈 문자열 반환

        const targetDate = new Date(dateString);
        const today = new Date();

        // 날짜가 같은지 비교 (년, 월, 일이 모두 같으면 오늘)
        const isToday = targetDate.getFullYear() === today.getFullYear() &&
            targetDate.getMonth() === today.getMonth() &&
            targetDate.getDate() === today.getDate();

        if (isToday) {
            // 오늘이면: 시:분 (HH:mm)
            const hours = String(targetDate.getHours()).padStart(2, '0');
            const minutes = String(targetDate.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            // 오늘이 아니면: 년-월-일 (YYYY-MM-DD)
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    };


    //rendar
    return (<>
        <div className="container">

            <div className="row">
                <div className="col text-light d-flex align-items-center">
                    {/* 제목 */}
                    <h1 className="m-0 me-3">
                        {board.boardTitle}
                        {board.boardEtime && (
                            <span className="ms-2 fs-6 text-secondary fw-normal">
                                (수정됨)
                            </span>
                        )}
                    </h1>
                    {/* 컨텐츠 제목 벳지 */}
                    {contentsTitle && (
                        <Link className="text-decoration-none" to={`/contents/detail/${board.boardContentsId}`}>
                            <h5 className="mt-4">
                                <span className="badge bg-primary">
                                    {contentsTitle}
                                </span>
                            </h5>
                        </Link>
                    )}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-light">
                    <h3>{board.boardWriter}</h3>
                </div>

            </div>

            <hr className="text-light" />

            <div className="row">
                <div className="col text-light d-flex align-items-center justify-content-end text-nowrap">
                    <span className="ms-4 me-5"><FaRegEye className="me-1" />{board.boardViewCount}</span>
                    <span>{getDisplayDate(board.boardWtime)}</span>
                </div>
            </div>
            {/* 본문 */}
            <div
                className="text-light"
                style={{
                    minHeight: "200px",
                    whiteSpace: "pre-wrap",
                    overflowX: "auto",
                    overflowY: "hidden",
                    maxWidth: "100%",
                    wordBreak: "break-word"
                }}
                dangerouslySetInnerHTML={{ __html: board.boardText }}
            ></div>

            {/* 좋아요 싫어요 */}
            <div className="row mt-5">
                <div className="col justify-content-center d-flex">
                    <div className="me-2">
                        {/* 좋아요 */}
                        {boardResponseVO.responseType === "좋아요" ? (
                            <h1 className="ms-2 border rounded p-4 text-primary bg-light"
                                onClick={changeLike}>
                                <FaRegThumbsUp className="mb-1" />
                            </h1>
                        ) : (
                            <h1 className="ms-2 border rounded p-4 text-primary"
                                onClick={changeLike}>
                                <FaRegThumbsUp className="mb-1" />
                            </h1>
                        )}
                        <h2 className="text-center mt-4">{boardResponseVO.likeCount}</h2>
                    </div>
                    <div className="ms-2">
                        {/* 싫어요 */}
                        {boardResponseVO.responseType === "싫어요" ? (
                            <h1 className="ms-2 border rounded p-4 text-danger bg-light"
                                onClick={changeUnlike}>
                                <FaRegThumbsDown className="mt-1" />
                            </h1>
                        ) : (
                            <h1 className="ms-2 border rounded p-4 text-danger"
                                onClick={changeUnlike}>
                                <FaRegThumbsDown className="mt-1" />
                            </h1>
                        )}
                        <h2 className="text-center mt-4">{boardResponseVO.unlikeCount}</h2>
                    </div>
                </div>
            </div>

            <hr className="text-light mt-5 mb-4" />

            {/* 댓글 */}

            {/* 댓글 수 */}
            <div className="row">
                <div className="col">
                    <h4><FaComment className="me-3" />{board.boardReplyCount}</h4>
                </div>
            </div>
            {/* 댓글 입력 창 */}
            <div className="row mt-4">
                <div className="col-12 d-flex align-items-stretch">
                    <div className="flex-grow-1">
                        <textarea
                            className="reply-write w-100"
                            name="replyContent"
                            value={reply.replyContent}
                            onChange={changeStrValue}
                            placeholder="댓글을 입력하세요"
                        />
                    </div>
                    <div className="ms-2">
                        <button
                            type="button"
                            className="reply-btn h-100 text-nowrap"
                            style={{ width: "80px" }}
                            onClick={sendData}>
                            등록
                        </button>
                    </div>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="row mt-4">
                <div className="col-12">
                    {replyList.map(replyDto => (
                        <div className="reply-card w-100 mb-3" key={replyDto.replyNo}>
                            {/* 수정 모드인지 확인 */}
                            {editReplyNo === replyDto.replyNo ? (
                                // 수정 댓글 창
                                <div>
                                    <textarea
                                        className="form-control mb-2 text-white bg-secondary border-0"
                                        style={{ resize: "none", minHeight: "100px" }}
                                        value={editContent}
                                        onChange={e => setEditContent(e.target.value)}
                                    />
                                    <div className="text-end">
                                        <button className="btn btn-sm btn-info me-2" onClick={updateReply}>저장</button>
                                        <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>취소</button>
                                    </div>
                                </div>
                            ) : (
                                // 일반 댓글 창
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="m-0 mt-2 fw-bold">{replyDto.replyWriter}</h5>
                                        <div className="m-0 d-flex text-nowarp">
                                            {replyDto.replyEtime ? (
                                                <span className="d-flex"><p className="text-info me-2">(수정됨)</p> {getDisplayDate(replyDto.replyEtime)}</span>
                                            ) : (
                                                <span>{getDisplayDate(replyDto.replyWtime)}</span>
                                            )}
                                            {!replyDto.owner && loginId && loginId !== replyDto.replyWriter && (
                                                <span className="ms-3" style={{ cursor: "pointer" }}>신고 🚨</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                                        {replyDto.replyContent}
                                    </div>

                                    {replyDto.owner && (
                                        <div className="text-end">
                                            <FaPen
                                                className="text-info me-3"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => startEdit(replyDto)}
                                            />
                                            <FaTrashAlt
                                                className="text-danger"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => deleteReply(replyDto.replyNo)}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>  

            <hr className="text-light mt-5 mb-4" />

            {/* 버튼 */}
            <div className="row mt-4 text-end">
                <div className="col">
                    <button type="button" className="btn btn-danger me-2" onClick={deleteBoard}>삭제</button>
                    <Link className="btn btn-secondary me-2" to={`/board/edit/${board.boardNo}`}>수정</Link>
                    <Link className="btn btn-info " to="/board/list">목록</Link>
                </div>
            </div>
        </div>
    </>)


}