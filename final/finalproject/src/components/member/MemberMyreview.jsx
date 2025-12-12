import { useAtom } from "jotai";
import { loginIdState, loginNicknameState } from "../../utils/jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./member.css";
import { FaHeart, FaStar } from "react-icons/fa";
export default function MemberMymovie() {
    //통합 state
    const [loginid, setLoginId] = useAtom(loginIdState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);


    //state
    const [hasReview, setHasReview] = useState(false);
    const [myReview, setMyReview] = useState([]);
    const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

    //callback
    const loadData = useCallback(async () => {
        const { data } = await axios.get(`/member/myreview/${loginid}`)
        setMyReview(data);
        if (data.length !== 0) {
            setHasReview(true);
        }
    }, [loginid]);

    //effect
    useEffect(() => {
        loadData();
    }, [loadData]);


    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);
    const getFormattedDate = useCallback((text) => {
        return text.substr(0, 10);
    }, []);

    const getFormattedPrice = useCallback((price) => {
        return price.toLocaleString('ko-KR');
    }, []);

    //render
    return (<>
        <h1 className="text-center mt-4"> {loginNickname}님의 리뷰</h1>

        {hasReview === false && (
            <div className="row mt-4">
                <Link to="/review/write" className="col-6 offset-3 btn btn-secondary">신규 리뷰작성</Link>
            </div>
        )}

        <div className="row mt-4">
            {myReview.map((review) => (
                <div className="col-6 col-sm-12 mx-2 my-2 mypage-review-card justify-content-between" key={review.reviewNo}>
                    <Link to={`/review/${review.reviewContents}/${review.reviewNo}`} className="reviewWrapper">
                        <div className="row mt-2">
                            <div className="col-4 d-flex justify-content-center">
                                <img className="img-fluid" src={getPosterUrl(review.contentsPosterPath)} style={{ height: "200px", objectFit: "cover", borderRadius: "4px" }} />
                            </div>
                            <div className="col-8 text-light ">
                                <div className="card-title fs-4 text-truncate">
                                    {review.contentsTitle}
                                </div>
                                <div className="mt-2">
                                    <div className="d-flex flex-nowrap">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <FaStar key={num} className={num <= review.reviewRating ? "fullStarReview" : "emptyStarReview"} />
                                        ))}
                                    </div>
                                    <div className="d-flex flex-nowrap mt-2">
                                        <span>평가가치 : 
                                            <span className="review-price-text me-2 ms-1">{getFormattedPrice(review.reviewPrice)}</span>
                                            원</span>
                                    </div>
                                    <div className="d-flex flex-nowrap mt-2">
                                        <span>작성일 :  <span className="text-muted">{getFormattedDate(review.reviewWtime)}</span></span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-light px-4 py-2 rounded-pill myreview-like"><FaHeart className="text-danger mb-1 me-1" /> {review.reviewLike}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    </>)
}