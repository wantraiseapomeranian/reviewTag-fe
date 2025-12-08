import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBookmark, FaHeart, FaPencil } from "react-icons/fa6";
import { FaQuestion } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


const INITIAL_DETAIL = {
    contentsId: null, contentsTitle: "", contentsType: "",
    contentsOverview: "", contentsPosterPath: "", contentsBackdropPath: "",
    contentsVoteAverage: 0, contentsRuntime: 0, contentsReleaseDate: "",
    contentsDirector: "", contentsMainCast: "", genreNames: [],
};

export default function ContentsDetail() {
    
    const {contentsId} = useParams();

    const navigate = useNavigate();

    //영화 정보 state
    const [contentsDetail, setContentsDetail] = useState(INITIAL_DETAIL);
    //영화 로딩 상태 state
    const [isLoading, setIsLoading] = useState(false);
    //상태 메세지 state
    const [statusMessage, setStatusMessage] = useState("");
    
    //effect
    useEffect(()=>{
        loadData();
    }, []);
    useEffect(()=>{
        if(isLoading === true) {
            setStatusMessage("로딩중...")
        }
    }, [isLoading]);
    
    //callback
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const {data} = await axios.get(`/api/tmdb/contents/detail/${contentsId}`);
        setContentsDetail(data);
        setIsLoading(false);
    }, []);

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    //리뷰버튼
     const writeReview = useCallback(()=>{
        if(!isLoading && contentsDetail.contentsId) {
            navigate(`/review/write/${contentsDetail.contentsId}`);
        }
    }, [navigate, isLoading, contentsDetail.contentsId]);
    
    
    //Memo
    //장르 목록을 react 엘리먼트로 변환하는 함수
    const renderGenres = useMemo(()=> {
        if (!contentsDetail.genreNames || contentsDetail.genreNames.length === 0) {
            return <span className="text-light">장르 정보 없음</span>;
        }
        return contentsDetail.genreNames.map((name, index) => (
            <span key={index} className="text-light me-1">
                {name}
            </span>
        ));
    }, [contentsDetail.genreNames]);

    //방영일 날짜 형식 변경
    const formattedDate = useMemo(()=> {
        const formattedDate = contentsDetail.contentsReleaseDate.split(" ")[0];
        return formattedDate;
    }, [contentsDetail.contentsReleaseDate]);    
    
    return(<>
        {isLoading && (
            <span>{statusMessage}</span>
        )}
        {/* 상세정보 카드 */}
        {!isLoading && contentsDetail.contentsId && (
            <div className="row p-3 shadow rounded">
                {/* 이미지 영역 */}
                <div className="col-4 col-sm-3 p-3 bg-secondary text-light rounded">
                    <img src={getPosterUrl(contentsDetail.contentsPosterPath)} style={{ height: "350px", objectFit: "cover"}}
                        alt={`${contentsDetail.contentsTitle} 포스터`} className="text-center w-100" />
                    <div>
                        <div className="mt-3">
                            <span>{contentsDetail.contentsType} / {contentsDetail.contentsRuntime} 분</span>
                        </div>
                        <div>
                            장르 : {renderGenres} 
                        </div>
                        <div>
                            방영일 : {formattedDate}
                        </div>
                        <div>
                            평점 : {contentsDetail.contentsVoteAverage.toFixed(1)} / 10
                        </div>        
                    </div>
                </div>
                {/* 텍스트 영역 */}
                <div className="col-7 col-sm-8 ms-4 mt-2">
                    <div className="ms-5 text-end">
                        <span className="badge bg-danger px-3 btn"><h5><FaBookmark/></h5></span>    
                    </div>
                    
                    <h3>{contentsDetail.contentsTitle}</h3>
                    
                    <div className="mt-4">
                        <h5>줄거리</h5>
                        <span className="text-muted break-word">
                            {contentsDetail.contentsOverview}
                        </span>
                    </div>
                    <div className="mt-3">
                        <h5>감독</h5>
                        <p>{contentsDetail.contentsDirector}</p>
                    </div>
                    <div className="mt-3">
                        <h5>주연</h5>
                        <p>{contentsDetail.contentsMainCast}</p>
                    </div>
                </div>
                <div className="text-end mb-3">
                    <button className="btn btn-success" onClick={writeReview}><FaPencil className="mb-1 me-1"/>리뷰등록</button>
                    <button className="btn btn-warning ms-2"><FaQuestion className="mb-1 me-1" /> 퀴즈</button>
                </div>    
            </div>
            )}    
    </>)
}