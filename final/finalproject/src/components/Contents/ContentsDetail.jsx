import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FaQuestion, FaShare } from "react-icons/fa";
import { useNavigate, useParams, Outlet, useLocation, Link } from "react-router-dom";
import { ImEyePlus } from "react-icons/im";
import { FaBookmark, FaChevronUp, FaHeart, FaPencil, FaStar } from "react-icons/fa6";
import { FcMoneyTransfer } from "react-icons/fc";

import "./SearchAndSave.css";
import "./Contents.css";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { toast } from "react-toastify";
import { set } from "lodash";
import { BsThreeDotsVertical } from "react-icons/bs";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


const INITIAL_DETAIL = {
    contentsId: null, contentsTitle: "", contentsType: "",
    contentsOverview: "", contentsPosterPath: "", contentsBackdropPath: "",
    contentsVoteAverage: 0, contentsRuntime: 0, contentsReleaseDate: "",
    contentsDirector: "", contentsMainCast: "", genreNames: [],
    contentsLike: 0, contentsRateAvg: 0, contentsPriceAvg: 0
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
    //나의 리뷰 state
    const [myReview, setMyReview] = useState(null);

    const [boardList, setBoardList] = useState([]);

    //effect
    //처음에 컨텐츠 정보와 리뷰 리스트를 불러오는 effect
    useEffect(() => {
        loadData();
        loadReview();
        loadBoard();
    }, [contentsId]);

    //북마크시 contentsLike를 갱신하기 위한 effect
    useEffect(() => {
        loadData();
    }, [loginId, hasWatchlist]);

    //loading 상태에 따라 loadingMeassge를 변경하는 effect
    useEffect(() => {
        if (isLoading === true) {
            setStatusMessage("로딩중...")
        }
    }, [isLoading]);

    useEffect(() => {
        checkWatchlist();
    }, [loginId, contentsId]);

    // 로그인 시 내 리뷰 조회
    useEffect(() => {
        if (!loginId) return;
        setIsLoading(true);
        const fetchMyReview = async () => {
            const { data } = await axios.get(`/review/user/${contentsId}/${loginId}`);
            setMyReview(data); // 없으면 null
        };
        fetchMyReview();
        setIsLoading(false);
    }, [loginId, contentsId]);


    //callback
    //contents 상세 정보
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const { data } = await axios.get(`/api/tmdb/contents/detail/${contentsId}`);
        // console.log("서버에서 받은 데이터:", data);
        setContentsDetail(data);
        setIsLoading(false);
    }, []);

    //review 목록
    const loadReview = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`/review/list/${contentsId}`);
            // console.log("넘어오는데이터:", data);
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

    // 콘텐츠 게시글 목록
     const formatWtime = (dateString)=>{
        const date = new Date(dateString);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${mm}/${dd}`
    }
    const loadBoard = useCallback(async()=>{
        const {data} = await axios.get(`/board/contentsId/${contentsId}`);
          const formattedData = data.map(board => ({
            ...board,
            boardWtime: formatWtime(board.boardWtime)
        }));
        setBoardList(formattedData);
    },[contentsId])




    // 북마크 확인(check) 함수
    const checkWatchlist = useCallback(async () => {
        if (loginId === "") return;
        const watchlistCheckData = {
            watchlistContent: contentsId,
            watchlistMember: loginId,
        };
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

    //나의 리뷰 날짜 형식 변경
    const myReviewDate = useMemo(() => {
        if (!myReview) return "";
        const formattedDate = myReview.reviewEtime
            ? myReview.reviewEtime.replace('T', ' ').substring(0, 16)
            : myReview.reviewWtime.replace('T', ' ').substring(0, 16);
        return formattedDate
    }, [myReview]);

    //나의 리뷰 가격 콤마
    const myReviewPrice = useMemo(() => {
        return myReview?.reviewPrice?.toLocaleString('ko-KR') ?? "";
    }, [myReview]);

    //컨텐츠 평균 가격 콤마
    const getContentsPriceAvg = useMemo(() => {
        const price = contentsDetail?.contentsPriceAvg;

        // 가격 데이터가 없거나(null/undefined) 숫자가 아닐 경우
        if (price === null || isNaN(price)) {
            return "0";
        }

        return Math.floor(price).toLocaleString('ko-KR');
    }, [contentsDetail]);

    //컨텐츠 별점 정수화
    const getContentsRateAvg = useMemo(() => {
        const rate = contentsDetail?.contentsRateAvg;

        if (rate === null || isNaN(rate)) {
            return 0;
        }

        return rate;
    }, [contentsDetail]);

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

        // 공유
        const handleShare = async () => {
            try {
                const shareUrl = `${window.location.origin}/review/${contentsId}/${review.reviewNo}`;

                // 클립보드에 복사
                await navigator.clipboard.writeText(shareUrl);
                // 성공 토스트 메시지
                toast.success("클립보드에 링크 복사!");
            }
            catch (error) {
                console.error("복사실패: ", error);
            }
        };

        // 날짜 포맷
        const formattedDate = review.reviewEtime
            ? review.reviewEtime.replace('T', ' ').substring(0, 16)
            : review.reviewWtime.replace('T', ' ').substring(0, 16);


        // 가격 포맷
        const formattedPrice = review.reviewPrice.toLocaleString('ko-KR');

        return (
            <div className="row mt-4 p-3 review-card">
                <div className="col mt-2">
                    <Link className="text-decoration-none link-body-emphasis text-light"
                        to={`/review/${contentsId}/${review.reviewNo}`}>
                        <div className="d-flex justify-content-between">
                            <h4 className="text-light">
                                {review.memberNickname}({review.reviewWriter}){review.reviewEtime ? " (수정됨)" : ""}
                            </h4>
                            <p className="text-light">{formattedDate}</p>
                        </div>

                        {/* 별점 */}
                        <div className="mt-1 d-flex align-items-center">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <FaStar key={num} style={{ color: num <= review.reviewRating ? "#ffc107" : "#444", marginRight: "2px" }} />
                            ))}
                            <span className="ms-2 text-light me-2">{review.reviewRating}점 • </span>

                            <span className="ms-2 text-light"><FcMoneyTransfer className="me-1" />{formattedPrice} 원</span>
                        </div>

                        {/* 내용 (스포일러) */}
                        <div className="mt-4">
                            {review.reviewSpoiler === "Y" && !showSpoiler ? (
                                <p onClick={() => setShowSpoiler(true)} className="text-danger fw-bold" style={{ cursor: "pointer" }}>
                                    🚨 스포일러가 포함된 리뷰입니다. (클릭하여 보기)
                                </p>
                            ) : (
                                <p className="break-word text-light text-truncate">{review.reviewText}</p>
                            )}
                        </div>
                        <hr className="HR mt-5" />
                    </Link>
                    {/* 좋아요 버튼 */}
                    <div className="text-start">
                        <span style={{ cursor: "pointer", }} onClick={handleLikeToggle}>
                            <span className="fs-4 me-2">
                                <FaHeart className={`${isLiked ? "text-danger" : ""}`} style={{ transition: "0.3s", }} />
                            </span>
                            <span className="fs-5">{likeCount}</span>
                        </span>
                        <button type="button" className="shareButton" onClick={handleShare}>
                            <FaShare className="share ms-4" />
                            <span className="ms-2">공유</span>
                        </button>
                    </div>
                </div>

            </div>
        );
    }

    // 공유
    const handleShare = async () => {
        try {
            const shareUrl = `${window.location.origin}/review/${contentsId}/${myReview.reviewNo}`;

            // 클립보드에 복사
            await navigator.clipboard.writeText(shareUrl);
            // 성공 토스트 메시지
            toast.success("클립보드에 링크 복사!");
        }
        catch (error) {
            console.error("복사실패: ", error);
        }
    };

    //render
    return (
        <>
            <div className="container mt-5">
                {isLoading && (
                    <span>{statusMessage}</span>
                )}


                {/* 상세정보 카드 */}
                {!isLoading && contentsDetail.contentsId && (
                    <>
                        <div className="row mt-4 p-3 shadow rounded dark-bg-wrapper">

                            <div className="text-end mb-3">
                                {hasWatchlist === false ? (
                                    <span className="badge bg-danger px-3 btn" onClick={changeWatchlist} style={{ cursor: "pointer" }}><h5><FaBookmark className="text-light" /></h5></span>
                                ) : (
                                    <span className="badge bg-danger px-3 btn" onClick={changeWatchlist} style={{ cursor: "pointer" }}><h5><FaBookmark className="text-dark" /></h5></span>
                                )}
                            </div>

                            {/* 이미지 영역 */}
                            <div className="col-12 col-md-4 p-4 black-bg-wrapper text-light rounded">
                                <img src={getPosterUrl(contentsDetail.contentsPosterPath)} style={{ height: "480px", objectFit: "cover", borderRadius: "4px", }}
                                    alt={`${contentsDetail.contentsTitle} 포스터`} className="text-center w-100" />
                                <div>
                                    <div className="mt-3">
                                        <span>{contentsDetail.contentsType} • {contentsDetail.contentsRuntime} 분</span>
                                    </div>
                                    <div>장르 : {renderGenres}</div>
                                    <div>방영일 : {formattedDate}</div>
                                    <div>평점 : {contentsDetail.contentsVoteAverage.toFixed(1)} / 10</div>
                                    <div className="mt-4 text-center">
                                        <div className="d-inline-flex align-items-center justify-content-center px-4 py-2 rounded-pill like-wrapper">
                                            <ImEyePlus className="me-2 text-info fs-3" />
                                            <span className="fw-bold fs-5">{contentsDetail.contentsLike.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 텍스트 영역 */}
                            <div className="col-9 col-md-7 ms-4 mt-4 text-light">
                                <h3 className="text-light">{contentsDetail.contentsTitle}</h3>
                                <div className="mt-5">  
                                    <h5>평균 점수</h5>
                                </div>
                                <div className="fs-5 d-flex align-items-center">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <FaStar key={num} style={{ color: num <= getContentsRateAvg ? "#ffc107" : "#444", marginRight: "2px" }} />
                                    ))}
                                    <span className="ms-2 text-light"> • <FcMoneyTransfer className="me-1" />{getContentsPriceAvg  } 원</span>
                                </div>
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

                            <div className="text-end mb-3 mt-2">
                                <button className="contents btn btn-success" onClick={writeReview}><FaPencil className="mb-1 me-1" /> 리뷰 등록</button>
                                <button className="contents btn btn-warning ms-2 text-light" onClick={goToQuiz}>
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

                {/* 컨텐츠 관련 게시글 */}
                <div className="mt-4 card quiz-dark-card text-center">
                    <div className="card-header fw-bold border-0 stats-header-dark p-3 fs-5">
                        관련 게시글
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr className="text-truncate quiz-table-thead">
                                    <th className="quiz-table-thead">번호</th>
                                    <th className="quiz-table-thead w-50">제목</th>
                                    <th className="quiz-table-thead">작성시간</th>
                                    <th className="quiz-table-thead">작성자</th>
                                </tr>
                            </thead>
                            <tbody >
                                {boardList.map((boardList)=>(
                                    <tr key={boardList.boardNo}>
                                        <td className="quiz-normal">{boardList.boardNo}</td>
                                        <td className="quiz-normal">{boardList.boardTitle}</td>
                                        <td className="quiz-normal">{boardList.boardWtime}</td>
                                        <td className="quiz-normal">{boardList.boardWriter}</td>
                                    </tr>
                            ))}
                            </tbody>
                    </table>
                    </div>
                </div>


                {/* 내 리뷰 */}
                {!isLoading && myReview && (
                    <div className="mt-4">
                        <div className="row mt-5">
                            <div className="col">
                                <h3 className="text-light">내 리뷰</h3>
                            </div>
                            <hr className="mt-2 HR mb-4" />
                        </div>
                        <div className="row mt-4 p-3 myreview-card">
                            <div className="col mt-2">
                                <Link className="text-decoration-none link-body-emphasis text-light"
                                    to={`/review/${contentsId}/${myReview.reviewNo}`}>
                                    <div className="d-flex justify-content-between">
                                        <h4 className="text-light">
                                            {contentsDetail.contentsTitle}{myReview.reviewEtime ? " (수정됨)" : ""}
                                        </h4>
                                        <p className="text-light">{myReviewDate}</p>
                                    </div>

                                    {/* 별점 */}
                                    <div className="mt-1 d-flex align-items-center">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <FaStar key={num} style={{ color: num <= myReview.reviewRating ? "#ffc107" : "#444", marginRight: "2px" }} />
                                        ))}
                                        <span className="ms-2 text-light me-2">{myReview.reviewRating}점 • </span>

                                        <span className="ms-2 text-light"><FcMoneyTransfer className="me-1" />{myReviewPrice} 원</span>
                                    </div>

                                    {/* 내용 (스포일러) */}
                                    <div className="mt-4">
                                        <p className="break-word text-light text-truncate">{myReview.reviewText}</p>
                                    </div>
                                    <hr className="HR mt-5" />
                                </Link>
                                {/* 공유 버튼 */}
                                <div className="text-start">
                                    <span>
                                        <span className="fs-4 me-2">
                                            <FaHeart className="text-danger" />
                                        </span>
                                        <span className="fs-5">{myReview.reviewLike}</span>
                                    </span>
                                    <button type="button" className="shareButton" onClick={handleShare}>
                                        <FaShare className="share ms-4" />
                                        <span className="ms-2">공유</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* 리뷰 목록 */}
                {!isLoading && reviewList && reviewList.length > 0 && (
                    <div className="mt-5">
                        <div className="row mt-5">
                            <div className="col">
                                <h3 className="text-light">리뷰</h3>
                            </div>
                            <hr className="mt-2 HR mb-4" />
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