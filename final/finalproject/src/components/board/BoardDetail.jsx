import axios from "axios";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react"
import { FaComment, FaRegEye, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
import { loginIdState } from "../../utils/jotai";



export default function BoardDetail() {

    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);

    const navigate = useNavigate();
    const { boardNo } = useParams();

    //state
    const [board, setBoard] = useState({
        boardNo: null, boardTitle: "", boardContentsId: null,
        boardWtime: "", boardEtime: "", boardText: "",
        boardLike: 0, boardUnlike: 0, boardReply: 0,
        boardNotice: "", boardViewCount: 0
    });
    const [contentsTitle, setContentsTitle] = useState("");

    const [boardResponseVO, setBoardResponseVO] = useState({
        response: false, responseType: "", likeCount: 0, unlikeCount: 0
    });


    // effect
    useEffect(() => {
        console.log(boardNo);
        loadData();
    }, [boardNo]);

    useEffect(() => {
        if (board.boardContentsId) {
            loadTitle(board.boardContentsId);
        }
    }, [board.boardContentsId]);

    useEffect(() => {
        checkResponse();
    }, [loginId, boardNo]);

    // callback
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

            if (boardResponseVO.response === true) {
                console.log("좋아요나 싫어요를 이미 눌렀습니다");
            }

            else {
                console.log("좋아요나 싫어요를 누르지 않은 상태입니다")
            }

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


    const deleteBoard = useCallback(async () => {
        const choice = window.confirm("게시글을 삭제하시겠습니까?");
        if (choice === false) return;
        try {
            await axios.delete(`/board/${boardNo}`);
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
            return `작성시각: ${hours}:${minutes}`;
        } else {
            // 오늘이 아니면: 년-월-일 (YYYY-MM-DD)
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            return `작성일: ${year}-${month}-${day}`;
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
                    <span>{getDisplayDate(board.boardWtime)}</span>
                    <span className="ms-4 me-5"><FaRegEye className="me-1 mb-1" />{board.boardViewCount}</span>
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
            <div className="row">
                <div className="col">
                    <h4><FaComment className="me-3" />{board.boardReply}</h4>
                </div>
            </div>

            <hr className="text-light mt-5 mb-4" />

            {/* 버튼 */}
            <div className="row mt-4">
                <div className="col">
                    <Link className="btn btn-secondary me-2" to="/board/list">전체목록</Link>
                    <Link className="btn btn-secondary me-2" to={`/board/edit/${board.boardNo}`}>수정</Link>
                    <button type="button" className="btn btn-secondary" onClick={deleteBoard}>삭제</button>
                </div>
            </div>
        </div>
    </>)


}