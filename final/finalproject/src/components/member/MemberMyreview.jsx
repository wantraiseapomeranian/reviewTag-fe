import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function MemberMymovie(){
//통합 state
const [loginid, setLoginId] = useAtom(loginIdState);

//state
const [myReview, setMyReview] = useState([]);
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    
//callback
const loadData = useCallback(async ()=>{
    const {data} = await axios.get(`/member/myreview/${loginid}`)
    setMyReview(data);
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


    {myReview.map((review) => (
    <div className="row mt-2" key={review.reviewNo}>
        <hr/>
        <div className="col-3">
            <img src={getPosterUrl(review.contentsPosterPath)} 
                style={{ height: "250px", objectFit: "cover", borderRadius: "4px", }}/>
        </div>
        <div className="col-1"></div>
        <div className="col-7 ms-4 mt-2 text-light">
            <h3><Link to={`/contents/detail/${review.reviewContents}`}>{review.contentsTitle}</Link></h3>
            평점: {review.reviewRating}
            <hr/>
            <br/>
            <p>내용: {review.reviewText}</p>
            <br/>
            <hr/>
            <p>좋아요: {review.reviewLike} | 작성시간: {review.reviewWtime}</p>
        </div>

    </div>
    ))}

    </>)
}