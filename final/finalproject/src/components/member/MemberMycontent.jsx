import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBookmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { MdFavorite } from "react-icons/md";

export default function MemberMycontent(){
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

    // 북마크 삭제 함수
    const deleteWatchlist = useCallback(async(contentsId)=>{
        const choice = window.confirm("리스트를 삭제하시겠습니까?");
        if(choice === false) return;
         try{
            await axios.delete(`/watchlist/${contentsId}/${loginId}`);
            console.log("삭제성공");
            toast.success("찜목록이 삭제되었습니다");
            loadData()
        }
        catch(err){
            console.error(err);
            toast.error("찜목록 삭제 실패");
            return;
        }
    },[loginId, loadData])

    // 북마크 TYPE 변경 함수 (찜 ->favorite)
    const changeWatchlistType = useCallback(async(contentsId)=>{
        const choice = window.confirm("인생작품으로 등록하시겠습니까?");
        if(choice === false) return;

        const watchlistData = {
            watchlistContent: contentsId,
            watchlistMember: loginId,
            watchlistType: "인생작",
        };
        try{
            await axios.put("/watchlist/", watchlistData)
            console.log("해제성공");
            toast.success("인생작품이 등록되었습니다");
            loadData()
        }
        catch(err){
            console.error(err);
            toast.error("인생작 등록 실패");
            return;
        }
    },[])

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    const getFormattedDate = useCallback((text) => {
        return text.substr(0, 10);
    }, []);

return(<>
    <h1 className="text-center"> {loginId}님의 <span className="text-info">WatchList</span></h1>

    <div className="row mt-2" >
    {myWatchlist.map((watchlist)=>(
            <div className="col-3 mt-4" key={watchlist.watchlistContent}>
                <div className="card h-100 bg-dark text-white border-secondary">
                    <Link className="text-decoration-none link-body-emphasis" to={`/contents/detail/${watchlist.watchlistContent}`} >
                        <img
                                src={getPosterUrl(watchlist.contentsPosterPath)}
                                className="card-img-top"
                                alt={watchlist.contentsTitle}
                                style={{ height: "300px", objectFit: "cover" }}
                        />
                    </Link>
                    <div className="row card-body">
                        <h5 className="col-12 col-sm-8 card-title text-truncate text-light">{watchlist.contentsTitle}</h5>
                            <span className="col-6 col-sm-2 badge bg-danger btn text-truncate" style={{cursor: "pointer"}} onClick={()=>deleteWatchlist(watchlist.watchlistContent)}>
                                <h5><FaBookmark className="text-dark"/></h5>
                            </span>
                            <span className="col-6 col-sm-2 badge bg-light btn text-truncate" style={{cursor: "pointer"}} onClick={()=>changeWatchlistType(watchlist.watchlistContent)}>
                                <h5><MdFavorite className="text-danger"/></h5>
                            </span>
                        <p className="card-text text-truncate">
                            <small className="text-secondary">등록일 | {getFormattedDate(watchlist.watchlistTime)}</small>
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
                </div>
            </div>                              
    ))}

    </div>   

</>)
}