import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./member.css";
import { FaStar } from "react-icons/fa";
export default function MemberMymovie(){
//통합 state
const [loginid, setLoginId] = useAtom(loginIdState);

//state
const [hasReview, setHasReview] = useState(false);
const [myReview, setMyReview] = useState([]);
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    
//callback
const loadData = useCallback(async ()=>{
    const {data} = await axios.get(`/member/myreview/${loginid}`)
    setMyReview(data);
    if(data.length !== 0) {
        setHasReview(true);
    }
}, [loginid]);

//effect
    useEffect(()=>{
        loadData();
    }, [loadData]);


    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);


//render
return(<>
    <h1 className="text-center"> {loginid}님의 리뷰</h1>

    {hasReview === false && (
        <div className="row mt-4">
            <Link to="/review/write" className="col-6 offset-3 btn btn-secondary">신규 리뷰작성</Link>
        </div>
    )} 


    {myReview.map((review) => (
    <div className="row mt-2" key={review.reviewNo}>
        <hr/>
        <div className="col-3">
            <Link to={`/contents/detail/${review.reviewContents}`} className="reviewTitle">
                <img src={getPosterUrl(review.contentsPosterPath)}  style={{ width: "180px", objectFit: "cover", borderRadius: "4px" }}/>
            </Link>
        </div>
        <div className="col-1"></div>
        <div className="col-7 ms-4 mt-2 text-light ">
            <div className="row">
                <div className="col-8">
                    <Link to={`/contents/detail/${review.reviewContents}`} className="reviewTitle">{review.contentsTitle}</Link>
                </div>
                <div className="col-4 ">
                    <div className="d-flex flex-nowrap">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <FaStar key={num} className={num <= review.reviewRating ? "fullStarReview" : "emptyStarReview"}/>
                    ))}
                    </div>
                    <div className="d-flex flex-nowrap justify-content-center">
                     <span>00,000원</span>
                     </div>
                </div>
            </div>
            <div className="bg-light text-dark p-3" style={{ minHeight: '10rem', borderRadius: "10px" }}> {review.reviewText}</div>
            <div className="mt-2 d-flex justify-content-between">
                <span>좋아요: {review.reviewLike}</span>
                <span>{review.reviewWtime}</span>
            </div>
        </div>

    </div>
    ))}

    </>)
}