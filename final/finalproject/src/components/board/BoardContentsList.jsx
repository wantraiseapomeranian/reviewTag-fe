import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom";
import "./Board.css";
import Pagination from "../Pagination";

export default function BoardContentsList(){
    const {contentsId} =useParams();


    //state
    const [boardList, setBoardList] = useState([]);
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState({
        page : 1,size : 10,  totalCount : 0, totalPage : 0, blockStart : 1, blockFinish : 1
    });

    //effect
    useEffect(()=>{
        loadBoard();
    },[page])

    const formatWtime = (dateString)=>{
        const date = new Date(dateString);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${mm}/${dd}`
    }

    //callback
    const loadBoard = useCallback(async()=>{
        const {data} = await axios.get(`/board/contentsId/${contentsId}/${page}`)
        console.log(data);
        const formattedData = data.list.map(board => ({
            ...board,
            boardWtime: formatWtime(board.boardWtime)
        }));
        setBoardList(formattedData);
        setPageData(data.pageVO);
    },[contentsId])


    //rendar
    return (<>

        <div className="mt-4 quizCard quiz-dark-card text-center">
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
                        {boardList.map((boardList)=>(
                            <tr key={boardList.boardNo}>
                                <td className="quiz-normal">{boardList.boardNo}</td>
                                <td className="quiz-normal">{boardList.boardContentsId}</td>
                                <td className="quiz-normal"><Link to={`/board/${boardList.boardNo}`} className="board-link">{boardList.boardTitle}</Link></td>
                                <td className="quiz-normal">{boardList.boardWtime}</td>
                                <td className="quiz-normal">{boardList.boardWriter}</td>
                            </tr>
                    ))}
                    </tbody>
            </table>
            </div>
            {/* 페이지네이션 */}
            <div className ="row mt-1">
                <div className="col-6 offset-3">
                        <Pagination
                        page={page}
                        totalPage={pageData.totalPage}
                        blockStart={pageData.blockStart}
                        blockFinish={pageData.blockFinish}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
        
        <div className="row">
            <div className="col">
                <Link className="btn btn-success"  to="/board/insert">
                    <span>작성</span>
                </Link>
            </div>
        </div>
    </>)
}