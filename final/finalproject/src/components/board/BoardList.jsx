import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom";



export default function BoardList(){
    
    //state
    const [boardList, setBoardList] = useState([]);

    //effect
    useEffect(()=>{
        loadBoard();
    },[])

    const formatWtime = (dateString)=>{
        const date = new Date(dateString);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${mm}/${dd}`
    }


    const loadBoard = useCallback(async()=>{
        const {data} = await axios.get("/board/")
          const formattedData = data.map(board => ({
            ...board,
            boardWtime: formatWtime(board.boardWtime)
        }));
        setBoardList(formattedData);
    },[])


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
                        {boardList.map((boardList)=>(
                            <tr key={boardList.boardNo}>
                                <td className="quiz-normal">{boardList.boardNo}</td>
                                <td className="quiz-normal">{boardList.boardContentsId}</td>
                                <td className="quiz-normal">{boardList.boardTitle}</td>
                                <td className="quiz-normal">{boardList.boardWtime}</td>
                                <td className="quiz-normal">{boardList.boardWriter}</td>
                            </tr>
                    ))}
                    </tbody>
            </table>
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