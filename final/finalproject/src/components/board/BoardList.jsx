import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom";
import "./Board.css";


export default function BoardList() {

    //state
    const [boardList, setBoardList] = useState([]);
    const [titles, setTitles] = useState({});

    //effect
    useEffect(() => {
        loadBoard();
    }, []);

    useEffect(() => {
        if (boardList.length > 0) {
            loadAllTitles();
        }
    }, [boardList]);

    const formatWtime = (dateString) => {
        const date = new Date(dateString);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${mm}/${dd}`
    };

    const loadBoard = useCallback(async () => {
        const { data } = await axios.get("/board/");
        const formattedData = data.map(board => ({
            ...board,
            boardWtime: formatWtime(board.boardWtime)
        }));
        setBoardList(formattedData);
    }, []);

    const loadAllTitles = async () => {
        // 이미 제목을 가져온 ID는 건너뛰기 위해 (최적화)
        const newTitles = { ...titles };

        // 비동기 요청들을 배열에 담음
        const promises = boardList.map(async (board) => {
            const id = board.boardContentsId;

            // ID가 있고, 아직 제목을 안 불러왔다면 요청
            if (id && !newTitles[id]) {
                try {
                    const { data } = await axios.get(`/api/tmdb/title/${id}`);
                    newTitles[id] = data; // { 12345: "아이언맨" } 식으로 저장
                } catch (e) {
                    newTitles[id] = "알 수 없음";
                }
            }
        });

        // 모든 요청이 끝날 때까지 기다림
        await Promise.all(promises);

        // 상태 한 번에 업데이트
        setTitles(newTitles);
    };


    //rendar
    return (<>

        <div className="mt-4 card quiz-dark-card text-center">
            <div className="card-header fw-bold border-0 stats-header-dark p-3 fs-5">
                게시글
            </div>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr className="text-truncate quiz-table-thead">
                            <th className="quiz-table-thead">번호</th>
                            <th className="quiz-table-thead">콘텐츠</th>
                            <th className="quiz-table-thead">제목</th>
                            <th className="quiz-table-thead">작성시간</th>
                            <th className="quiz-table-thead">작성자</th>
                        </tr>
                    </thead>
                    <tbody >
                        {boardList.map((board) => (
                            <tr key={board.boardNo}>
                                <td className="quiz-normal">{board.boardNo}</td>
                                <td className="quiz-normal">{board.boardContentsId ? (titles[board.boardContentsId] || "로딩중...") : "-"}</td>
                                <td className="quiz-normal"><Link to={`/board/${board.boardNo}`} className="board-link">{board.boardTitle}</Link></td>
                                <td className="quiz-normal">{board.boardWtime}</td>
                                <td className="quiz-normal">{board.boardWriter}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="row">
            <div className="col">
                <Link className="btn btn-success" to="/board/insert">
                    <span>작성</span>
                </Link>
            </div>
        </div>
    </>)
}