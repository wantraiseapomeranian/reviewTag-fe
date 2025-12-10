import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";



export default function MemberMymovie(){
    const [loginId, setLoginId] = useAtom(loginIdState);

    //state
    const [hasWatchlist, setHasWatchlist] = useState(false);
    const [myWatchlist, setMyWatchlist] = useState([]);
    const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

    //callback
    const loadData = useCallback(async()=>{
        const {data} = await axios.get(`/member/mywatch/${loginId}`)
        setMyWatchlist(data);
        if(data.length !== 0){
            setHasWatchlist(true);
        }
    },[loginId]);

    //effect
    useEffect(()=>{
        loadData();
    },[loadData]);

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    const getFormattedDate = useCallback((text) => {
        return text.substr(0, 10);
    }, []);

return(<>
    <h1 className="text-center"> {loginId}님의 <span className="text-info">WatchList</span></h1>

    <div className="row mt-4" >
    {myWatchlist.map((watchlist)=>(
            <div className="col-6 mt-4" key={watchlist.watchlistContent}>
                <div className="card h-100 bg-dark text-white border-secondary">
                    <Link className="text-decoration-none link-body-emphasis" to={`/contents/detail/${watchlist.watchlistContent}`} >
                            <img
                                src={getPosterUrl(watchlist.contentsPosterPath)}
                                className="card-img-top"
                                alt={watchlist.contentsTitle}
                                style={{ height: "350px", objectFit: "cover" }}
                            />
                        <div className="card-body">
                            <h5 className="card-title text-truncate text-light">{watchlist.contentsTitle}</h5>
                            <p className="card-text">
                                <small className="text-secondary">{getFormattedDate(watchlist.watchlistTime)}</small>
                                <br />
                                <span className="badge bg-warning text-dark me-1">
                                    {watchlist.contentsType}
                                </span>
                                <span className="badge bg-success text-light me-1">
                                    {watchlist.contentsDirector}
                                </span>
                                <span className="badge bg-success text-light me-1">
                                        {watchlist.contentsMainCast}
                                </span>
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
    ))}
    </div>  
            
                    {/* <tr>
                        <td>
                            <Link to={`/contents/detail/${watchlist.watchlistContent}`} className="reviewTitle">
                                <span className="text-success">{watchlist.contentsTitle}</span>
                            </Link>
                            <p>{watchlist.contentsType} | {watchlist.contentsRuntime} 분</p>
                            <p>{watchlist.contentsDirector} | {watchlist.contentsMainCast}</p>
                        </td>
                        <td>
                            {watchlist.watchlistType} <br/>
                            {watchlist.watchlistTime}</td>
                    </tr> */}

  




</>)
}