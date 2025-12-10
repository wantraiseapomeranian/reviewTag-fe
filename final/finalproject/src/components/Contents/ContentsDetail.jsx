import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FaQuestion } from "react-icons/fa";
import { useNavigate, useParams, Outlet, useLocation } from "react-router-dom";

import { FaBookmark, FaChevronUp, FaHeart, FaPencil, FaStar } from "react-icons/fa6";
import { FcMoneyTransfer } from "react-icons/fc";

import "./SearchAndSave.css"
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { toast } from "react-toastify";
import { set } from "lodash";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


const INITIAL_DETAIL = {
    contentsId: null, contentsTitle: "", contentsType: "",
    contentsOverview: "", contentsPosterPath: "", contentsBackdropPath: "",
    contentsVoteAverage: 0, contentsRuntime: 0, contentsReleaseDate: "",
    contentsDirector: "", contentsMainCast: "", genreNames: [],
};

export default function ContentsDetail() {

    //통합 state
    const [loginId, setLoginId] = useAtom(loginIdState);

    const { contentsId } = useParams();
    const navigate = useNavigate();


    const location = useLocation();

    //현재 위치가 /contents/detail/:contentsId/quiz인지 확인
    const isQuizOpen = location.pathname.includes('/quiz');

    // 북마크 확인용 state
    const [hasWatchlist, setHasWatchList] = useState(false);

    //영화 정보 state
    const [contentsDetail, setContentsDetail] = useState(INITIAL_DETAIL);
    //영화 로딩 상태 state
    const [isLoading, setIsLoading] = useState(false);
    //상태 메세지 state
    const [statusMessage, setStatusMessage] = useState("");
    //리뷰 목록 state
    const [reviewList, setReviewList] = useState([]);

    //effect
    useEffect(() => {
        loadData();
        loadReview();
    }, []);

    useEffect(() => {
        if (isLoading === true) {
            setStatusMessage("로딩중...")
        }
    }, [isLoading]);

    useEffect(() => {
        checkWatchlist();
    }, [loginId, contentsId]);

    //callback
    //contents 상세 정보
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const { data } = await axios.get(`/api/tmdb/contents/detail/${contentsId}`);
        setContentsDetail(data);
        setIsLoading(false);
    }, []);

    //review 목록
    const loadReview = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`/review/list/${contentsId}`);
            console.log("넘어오는데이터:",data);
            const reviewlist = [
                ...data.map(review => ({ ...review }))
            ];
            setReviewList(reviewlist);
        }
        catch (error) {
            console.log("에러 발생 : ", error);
        }
        setIsLoading(false);
    }, []);

    // 북마크 확인(check) 함수
    const checkWatchlist = useCallback(async () => {
        if (loginId === "") return;
        const watchlistCheckData = {
            watchlistContent: contentsId,
            watchlistMember: loginId,
        };
        console.log(watchlistCheckData);
        try {
            const { data } = await axios.post("/watchlist/check", watchlistCheckData);
            if (data.hasWatchlist === true) {
                console.log("북마크 등록되어있음");
                setHasWatchList(true);
                // 기타 추가 기능 구현
            } else {
                console.log("북마크 없음");
                setHasWatchList(false);
            }
        }
        catch (err) {
            console.log("북마크 확인 error");
            console.error(err);
        }
    }, [contentsId, loginId]);


    // 북마크 등록/삭제 함수
    const changeWatchlist = useCallback(async (e) => {
        if (loginId === "") {
            toast.error("로그인이 필요한 기능입니다");
            return;
        }
        const watchlistData = {
            watchlistContent: contentsId,
            watchlistMember: loginId,
            watchlistType: "찜",
        };

        //state 먼저변경
        const newHasWatchlist = !hasWatchlist;
        setHasWatchList(newHasWatchlist);

        if (hasWatchlist === true) { // 이미 북마크 등록되어있다면
            try {
                await axios.delete(`/watchlist/${contentsId}/${loginId}`);
                console.log("삭제성공");
                toast.success("찜목록이 삭제되었습니다");
            }
            catch (err) {
                console.error(err);
                toast.error("찜목록 삭제 실패");
                setHasWatchList(!newHasWatchlist);
            }
        }
        else { // 북마크가 되어있지 않다면
            try {
                await axios.post("/watchlist/", watchlistData);
                console.log("등록성공");
                toast.success("찜목록에 등록되었습니다");
            }
            catch (err) {
                console.error(err);
                toast.error("찜목록 등록 실패");
                setHasWatchList(!newHasWatchlist);
            }
        }
    }, [contentsId, loginId, hasWatchlist]);

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    //리뷰버튼
    const writeReview = useCallback(() => {
        if (!isLoading && contentsDetail.contentsId) {
            navigate(`/review/write/${contentsDetail.contentsId}`);
        }
    }, [navigate, isLoading, contentsDetail.contentsId]);

    //퀴즈 버튼
    const goToQuiz = () => {
        if (isQuizOpen) {
            // 이미 열려있으면 -> 닫기
            navigate(`/contents/detail/${contentsId}`);
        } else {
            // 닫혀있으면 -> 열기
            navigate(`quiz`);
        }
    };

    //Memo
    //장르 목록을 react 엘리먼트로 변환하는 함수
    const renderGenres = useMemo(() => {
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
    const formattedDate = useMemo(() => {
        const formattedDate = contentsDetail.contentsReleaseDate.split(" ")[0];
        return formattedDate;
    }, [contentsDetail.contentsReleaseDate]);

    /// 리뷰 목록 모듈화
    function ReviewItem({ review, loginId }) {
        const [isLiked, setIsLiked] = useState(false);
        const [likeCount, setLikeCount] = useState(review.reviewLike || 0);
        const [showSpoiler, setShowSpoiler] = useState(false);

        // 좋아요 확인
        useEffect(() => {
            if (loginId) {
                axios.post("/review/check", null, {
                    params: { loginId: loginId, reviewNo: review.reviewNo }
                }).then(res => {
                    setIsLiked(res.data.like);
                }).catch(err => console.error(err));
            }
        }, [loginId, review.reviewNo]);

        // 좋아요 토글
        const handleLikeToggle = async () => {
            if (!loginId) {
                toast.error("로그인이 필요합니다.");
                return;
            }
            try {
                const res = await axios.post(`/review/action/${review.reviewNo}/${loginId}`);
                setIsLiked(res.data.like);
                setLikeCount(res.data.count);
            } catch (err) {
                console.error(err);
            }
        };

        // 날짜 포맷
        const formattedDate = review.reviewEtime
            ? review.reviewEtime.replace('T', ' ').substring(0, 16)
            : review.reviewWtime.replace('T', ' ').substring(0, 16);

        return (
            <div className="row mt-4 p-3 shadow rounded dark-bg-wrapper">
                <div className="col mt-2">
                    <div className="d-flex justify-content-between">
                        <h4 className="text-light">
                            
                            {review.reviewWriter}{review.reviewEtime ? " (수정됨)" : ""}
                        </h4>
                        <p className="text-light">{formattedDate}</p>
                    </div>

                    {/* 별점 */}
                    <div className="mt-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <FaStar key={num} style={{ color: num <= review.reviewRating ? "#ffc107" : "#444", marginRight: "2px" }} />
                        ))}
                        <span className="ms-2 text-light small me-2">{review.reviewRating}점</span>
                        • <span className="ms-2"><FcMoneyTransfer className="me-1" />(가격) 원</span>
                    </div>

                    {/* 내용 (스포일러) */}
                    <div className="mt-4">
                        {review.reviewSpoiler === "Y" && !showSpoiler ? (
                            <p onClick={() => setShowSpoiler(true)} className="text-danger fw-bold" style={{ cursor: "pointer" }}>
                                🚨 스포일러가 포함된 리뷰입니다. (클릭하여 보기)
                            </p>
                        ) : (
                            <p className="break-word text-light">{review.reviewText}</p>
                        )}
                    </div>

                    {/* 좋아요 버튼 */}
                    <div className="text-end">
                        <span
                            className={`d-inline-block px-2 pb-2 pt-1 rounded ${isLiked ? "bg-danger" : ""}`}
                            style={{ cursor: "pointer", transition: "0.3s" }}
                            onClick={handleLikeToggle}
                        >
                            <span className="fs-4 me-2">👍🏻</span>
                            <span className="fs-5">{likeCount}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    //render
    return (
        <>
            <div className="container mt-4">
                {isLoading && (
                    <span>{statusMessage}</span>
                )}


                {/* 상세정보 카드 */}
                {!isLoading && contentsDetail.contentsId && (
                    <>
                        <div className="row p-3 shadow rounded dark-bg-wrapper">
                            <div className="text-end mt-4" onClick={changeWatchlist}>
                                {hasWatchlist === false ? (
                                    <span className="badge bg-danger px-3 btn" style={{ cursor: "pointer" }}><h5><FaBookmark className="text-light" /></h5></span>
                                ) : (
                                    <span className="badge bg-danger px-3 btn" style={{ cursor: "pointer" }}><h5><FaBookmark className="text-dark" /></h5></span>
                                )}
                            </div>

                            {/* 이미지 영역 */}
                            <div className="col-4 col-sm-3 p-4 black-bg-wrapper text-light rounded">
                                <img src={getPosterUrl(contentsDetail.contentsPosterPath)} style={{ height: "350px", objectFit: "cover", borderRadius: "4px", }}
                                    alt={`${contentsDetail.contentsTitle} 포스터`} className="text-center w-100" />
                                <div>
                                    <div className="mt-3">
                                        <span>{contentsDetail.contentsType} • {contentsDetail.contentsRuntime} 분</span>
                                    </div>
                                    <div>장르 : {renderGenres}</div>
                                    <div>방영일 : {formattedDate}</div>
                                    <div>평점 : {contentsDetail.contentsVoteAverage.toFixed(1)} / 10</div>
                                </div>
                            </div>

                            {/* 텍스트 영역 */}
                            <div className="col-7 col-sm-8 ms-4 mt-2 text-light">
                                <h3 className="text-light">{contentsDetail.contentsTitle}</h3>
                                <div className="mt-4">
                                    <h5>줄거리</h5>
                                    <span className="break-word">{contentsDetail.contentsOverview}</span>
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
                                <button className="btn btn-success" onClick={writeReview}><FaPencil className="mb-1 me-1" />리뷰등록</button>
                                <button className="btn btn-warning ms-2" onClick={goToQuiz}>
                                    {isQuizOpen ? (
                                        <><FaChevronUp className="mb-1 me-1" /> 퀴즈 닫기</>
                                    ) : (
                                        <><FaQuestion className="mb-1 me-1" /> 퀴즈 풀기</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 중첩 라우팅 자리 */}
                        <div className="mt-4">
                            <Outlet />
                        </div>
                    </>
                )}

                {/* 리뷰 목록 */}
                {!isLoading && reviewList && reviewList.length > 0 && (
                    <div className="mt-5">
                        <div className="row mt-5">
                            <div className="col">
                                <h3 className="text-light">리뷰</h3>
                            </div>
                        </div>
                        {reviewList.map((review) => (
                            <ReviewItem 
                                key={review.reviewNo} 
                                review={review} 
                                loginId={loginId} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}