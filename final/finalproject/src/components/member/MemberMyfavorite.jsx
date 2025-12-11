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
        const choice = window.confirm("리스트를 해제하시겠습니까?");
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

    // 북마크 TYPE 변경 함수
    const changeWatchlistType = useCallback(async(contentsId)=>{
        const choice = window.confirm("인생작품을 해제하시겠습니까?");
        if(choice === false) return;

        const watchlistData = {
            watchlistContent: contentsId,
            watchlistMember: loginId,
            watchlistType: "찜",
        };
        try{
            await axios.put("/watchlist/", watchlistData)
            console.log("해제성공");
            toast.success("인생작품이 해제되었습니다");
            loadData()
        }
        catch(err){
            console.error(err);
            toast.error("인생작 해제 실패");
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
    <h1 className="text-center"> {loginId}님의 <span className="text-info">인생작</span></h1>
    
    <div className="row mt-4" >
        {myWatchlist.map((watchlist)=>(
            <div key={watchlist.watchlistContent}>
                {watchlist.watchlistType === "인생작" && (
                    <div className="row mt-3">
                        <Link className="col-4" to={`/contents/detail/${watchlist.watchlistContent}`} >
                            <img
                                    src={getPosterUrl(watchlist.contentsPosterPath)}
                                    className="card-img-top"
                                    alt={watchlist.contentsTitle}
                                    style={{ height: "350px", objectFit: "cover" }}
                            />
                        </Link>
                        <div className="col-8" >
                                <div className="row">
                                    <div className="col-8">
                                        <h5 className="card-title text-truncate text-light">{watchlist.contentsTitle}</h5>
                                        <p className="card-text text-truncate">
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
                                    <div className="col-4">
                                        <span className="me-2 mb-2 badge bg-danger btn" style={{cursor: "pointer"}} onClick={()=>deleteWatchlist(watchlist.watchlistContent)}>
                                            <h5><FaBookmark className="text-dark"/></h5>
                                        </span>
                                        <span className="badge bg-light btn" style={{cursor: "pointer"}} onClick={()=>changeWatchlistType(watchlist.watchlistContent)}>
                                            <h5><MdFavorite className="text-danger"/></h5>
                                        </span>
                                    </div>
                                </div>
                             <div className="row mt-4">
                                    {/* 기타 추가 내용 들어갈 곳 */}
                                    <div className="col bg-dark text-white">
                                    기타 추가 내용 들어갈 곳
                                    </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>                    
        ))}
    </div>  

</>)
}