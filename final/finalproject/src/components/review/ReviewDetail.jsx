import { useAtom } from "jotai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { accessTokenState, loginIdState, loginLevelState, loginNicknameState, refreshTokenState } from "../../utils/jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./review.css";
import { FaStar } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaShare, FaXmark } from "react-icons/fa6";
import { IoHeartCircleSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";
import { FcMoneyTransfer } from "react-icons/fc";
import { FaRegEye } from "react-icons/fa";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const INITIAL_DETAIL = {
    contentsId: null, contentsTitle: "", contentsType: "",
    contentsOverview: "", contentsPosterPath: "", contentsBackdropPath: "",
    contentsVoteAverage: 0, contentsRuntime: 0, contentsReleaseDate: "",
    contentsDirector: "", contentsMainCast: "", genreNames: [],
};

export default function ReviewDetail() {
    const { contentsId, reviewNo } = useParams();
    const navigate = useNavigate();

    //state
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);


    const [review, setReview] = useState({
        reviewRating: 0,
        reviewSpoiler: "N",
        reviewText: "",
        reviewLike: 0,
        reviewRealiability: 0,
        reviewPrice: "",
        reviewWtime: "",
        reviewEtime: "",
        reviewWriter: ""
    });

    const [reviewClass, setReviewClass] = useState("");
    //영화 정보 state
    const [contentsDetail, setContentsDetail] = useState(INITIAL_DETAIL);
    //영화 로딩 상태 state
    const [isLoading, setIsLoading] = useState(false);
    //상태 메세지 state
    const [statusMessage, setStatusMessage] = useState("");
    //화면 조건 렌더링 + 리뷰 state
    const [isUpdateReview, setIsUpdateReview] = useState(() => !reviewNo);
    //리뷰 존재 여부 state
    const [userReviewExists, setUserReviewExists] = useState(false);

    const [allReviews, setAllReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);

    const reviewData = {
        ...review,
        reviewContents: contentsId,
    };

    //effect
    useEffect(() => {
        if (isLoading === true) {
            setStatusMessage("로딩중...")
        }
    });

    useEffect(() => {
        if (!contentsId) {
            setStatusMessage("영화 정보를 찾을 수 없습니다.")
            return;
        }
        loadContentData();
    }, [accessToken, contentsId])


    useEffect(() => {
        const fetchReview = async () => {
            try {
                setIsLoading(true);
                const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

                const { data } = await axios.get(`/review/${contentsId}/${reviewNo}`, { headers });
                if (data) {
                    setReview({
                        ...data,
                        reviewNo: reviewNo
                    });
                    setRating(data.reviewRating);
                    setLikeCount(data.reviewLike);
                    setWriter(data.reviewWriter);
                    setSpoiler(data.reviewSpoiler);
                    console.log(data.reviewWriter, "작성자");
                }
                if (accessToken && loginId) {
                    const { data: likeData } = await axios.post(
                        "/review/check",
                        null,
                        { params: { loginId, reviewNo } }
                    );
                    setIsLiked(likeData.like);
                } else {
                    setIsLiked(false);
                }

            } catch (error) {
                if (error.response?.status === 401) setStatusMessage("로그인이 필요합니다.");
                if (error.response?.status === 404) setStatusMessage("존재하지 않는 리뷰입니다.");
                if (error.response?.status === 500) setStatusMessage("리뷰를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReview();
    }, [reviewNo, contentsId, accessToken]);


    const loadContentData = useCallback(async () => {
        if (!contentsId) return;

        try {
            setIsLoading(true);
            setStatusMessage("영화 정보를 불러오는 중...");

            const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
            const { data } = await axios.get(`/api/tmdb/contents/detail/${contentsId}`, { headers });

            setContentsDetail(data);
            setStatusMessage("");
        } catch (error) {
            console.error(error);
            setStatusMessage("영화 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [contentsId, accessToken]);


    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    //별점 기능 구현
    const [rating, setRating] = useState(0);
    const [ratingAlert, setRatingAlert] = useState(false);

    const handleStarClick = (num) => {
        setRating(num);  // 클릭한 별 번호로 rating 설정
        setReview(prev => ({
            ...prev,
            reviewRating: num
        }));
    };


    //Memo
    //장르 목록을 react 엘리먼트로 변환하는 함수
    const renderGenres = useMemo(() => {
        if (!contentsDetail.genreNames || contentsDetail.genreNames.length === 0) {
            return <span className="text-muted">장르 정보 없음</span>;
        }
        return contentsDetail.genreNames.map((name, index) => (
            <span key={index} className="text-muted me-1">
                {name}
            </span>
        ));
    }, [contentsDetail.genreNames]);

    //방영일 날짜 형식 변경
    const formattedDate = useMemo(() => {
        const formattedDate = contentsDetail.contentsReleaseDate.split(" ")[0];
        return formattedDate;
    }, [contentsDetail.contentsReleaseDate]);


    //공유하기(링크복사)
    const [link, setLink] = useState("");
    const copyLink = () => {
        const currentUrl = window.location.href;
        setLink(currentUrl);
        navigator.clipboard.writeText(currentUrl)
            .then(() => alert("링크가 복사되었습니다!"))
            .catch(err => console.error("복사 실패", err));
    };

    //좋아요 state
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // 좋아요 확인
    useEffect(() => {
        if (loginId) {
            axios.post("/review/check", null, {
                params: { loginId: loginId, reviewNo: reviewNo }
            }).then(res => {
                setIsLiked(res.data.like);
            }).catch(err => console.error(err));
        }
    }, [loginId, reviewNo]);

    // 좋아요 토글
    const handleLikeToggle = async () => {
        if (!loginId) {
            toast.info("로그인이 필요합니다.");
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

    //날짜 포맷
    const reviewDate = review.reviewEtime
        ? review.reviewEtime.replace('T', ' ').substring(0, 16)
        : review.reviewWtime.replace('T', ' ').substring(0, 16);

    //모달
    const modal1 = useRef();
    const modal2 = useRef();
    const modal3 = useRef();

    const openModal1 = () => {
        const open = new Modal(modal1.current);
        open.show();
    }
    const openModal2 = () => {
        const open = new Modal(modal2.current);
        open.show();
    }
    const openModal3 = () => {
        const open = new Modal(modal3.current);
        open.show();
    }
    const closeModal1 = () => {
        const close = Modal.getInstance(modal1.current);
        if (close) close.hide();
    }
    const closeModal2 = () => {
        const close = Modal.getInstance(modal2.current);
        if (close) close.hide();
    }
    const closeModal3 = () => {
        const close = Modal.getInstance(modal3.current);
        if (close) close.hide();
    }


    // const openModal = useCallback(() => {
    //     const bsModal = new Modal(modal.current);
    //     bsModal.show();
    // }, [modal]);
    // const closeModal = useCallback(() => {
    //     const bsModal = Modal.getInstance(modal.current);
    //     if (bsModal) bsModal.hide();
    // }, [modal]);

    //작성자
    const [writer, setWriter] = useState("");

    //작성자 = loginId 비교
    const isWriter = useMemo(() => {
        return loginId === review.reviewWriter;
    }, [loginId, review.reviewWriter])

    //삭제 state
    const Ondelete = useCallback(async () => {
        const url = `/review/${contentsId}/${reviewNo}`;
        console.log("최종 삭제 요청 URL:", url);

        try {
            const { data } = await axios.delete(`/review/${contentsId}/${reviewNo}`)
            toast.success("리뷰 삭제 완료");
            navigate("/");
        }
        catch (error) {
            console.error("리뷰 삭제 오류:", error.response);
            toast.error("리뷰 삭제 중 오류가 발생했습니다");
        }
    }, [reviewNo, contentsId])

    //스포일러
    const [spoiler, setSpoiler] = useState("");

    const isSpoiler = useMemo(() => {
        return review.reviewSpoiler === "Y";
    }, [review.reviewSpoiler])


    //render
    return (<>
        <div className="container">
            <div className="row">
                <div className="col d-flex justify-content-between align-items-center">
                    {/* 본인이면  mainTitleB 버튼 나와서 수정, 삭제  모달*/}
                    <span className="mainTitle mx-auto">리뷰</span>
                    {isWriter && (
                        <button className="mainTitleB" type="button" onClick={openModal1}
                            data-bs-dismiss="ModalToggle1"
                        ><BsThreeDotsVertical /></button>
                    )}
                </div>
                <div className="mt-4 mb-4">
                    <span className="userId">닉네임</span>
                    <span className="time ms-3">{formattedDate}</span>
                </div>
                <div className="col title mb-2">
                    {contentsDetail.contentsTitle}
                </div>
                <div className="d-flex align-items-center mb-3">
                    {isWriter && (
                        <span className="me-2">내 평가</span>
                    )}
                    <span><FaStar className="littleStar me-1 mb-1" />{reviewDate}</span>
                    <span className="ms-3"><FcMoneyTransfer className="me-2" />{review.reviewPrice}원</span>
                </div>
                <hr className="HR" />
                {isSpoiler && (
                    <div className="detailSpo"><FaRegEye /> 스포일러</div>
                )}
                <div className="mt-2 reviewText">{review.reviewText}</div>
                <div className="col iconBox">
                    <div className="ms-2">
                        <span><IoHeartCircleSharp className="me-2 iconH" />
                            <span style={{ fontSize: "20px" }}>{likeCount}개</span>
                        </span>
                    </div>
                    <hr className="HR" />
                    <div className="mb-1">
                        <button onClick={handleLikeToggle} style={{ color: isLiked ? "#7188faff" : "white" }} type="button" className="mainTitleB"><FaHeart className="me-2 icon ms-1" />좋아요</button>
                        <button onClick={copyLink} type="button" className="ms-2 mainTitleB"><FaShare className="me-2 icon" />공유하기</button>
                    </div>

                </div>
            </div>
            {/* 수정하기 */}
            <div className="row">
                <div className="col d-flex justify-content-between align-items-center">
                    {/* 본인이면  mainTitleB 버튼 나와서 수정, 삭제  모달*/}
                    <span className="mainTitle mx-auto">리뷰</span>
                    {isWriter && (
                        <button className="mainTitleB" type="button" onClick={openModal1}
                            data-bs-dismiss="ModalToggle1"
                        ><BsThreeDotsVertical /></button>
                    )}
                </div>
                <div className="mt-4 mb-4">
                    <span className="userId">닉네임</span>
                    <span className="time ms-3">{formattedDate}</span>
                </div>
                <div className="col title mb-2">
                    {contentsDetail.contentsTitle}
                </div>
                <div className="d-flex align-items-center mb-3">
                    {isWriter && (
                        <span className="me-2">내 평가</span>
                    )}
                    <span><FaStar className="littleStar me-1 mb-1" />{reviewDate}</span>
                    <span className="ms-3"><FcMoneyTransfer className="me-2" />{review.reviewPrice}원</span>
                </div>
                <hr className="HR" />
                <div className="reviewText">{review.reviewText}</div>
                <div className="col iconBox">
                    <div className="ms-2">
                        <span><IoHeartCircleSharp className="me-2 iconH" />
                            <span style={{ fontSize: "20px" }}>{likeCount}개</span>
                        </span>
                    </div>
                    <hr className="HR" />
                    <div className="mb-1">
                        <button onClick={handleLikeToggle} style={{ color: isLiked ? "#7188faff" : "white" }} type="button" className="mainTitleB"><FaHeart className="me-2 icon ms-1" />좋아요</button>
                        <button onClick={copyLink} type="button" className="ms-2 mainTitleB"><FaShare className="me-2 icon" />공유하기</button>
                    </div>

                </div>
            </div>
            {/* 모달(Modal) */}
            <div className="modal fade" id="ModalToggle1" tabIndex="-1" ref={modal1}
                data-bs-keyboard="false">
                <div className="modal-dialog modal-sm">
                    <div className="one">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div>
                                    <button type="button" className="modalButtonX" onClick={closeModal1}>
                                        <FaXmark />
                                    </button>
                                </div>
                                <div>
                                    <button type="button" className="ms-2 mt-2 modalButton"
                                        onClick={openModal3}>리뷰 수정하기</button>
                                </div>
                                <div>
                                    <button type="button" className="ms-2 modalButton mt-4"
                                        onClick={openModal2}>리뷰 삭제하기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 삭제 모달 */}
            <div className="modal fade" id="ModalToggle2" data-bs-backdrop="static" tabIndex="-1" ref={modal2}
                data-bs-keyboard="false">
                <div className="modal-dialog modal-sm">
                    <div className="two">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="ask text-center mt-2">
                                    작성하신 리뷰가 삭제됩니다
                                    <span className="ms-2" style={{ fontSize: "25px" }}>😭</span>
                                </div>
                                <div className="realMessage text-center mt-2">
                                    정말 삭제하시나요?
                                </div>
                                <div className="mt-3 d-flex justify-content-between">
                                    <button type="button" onClick={() => {
                                        closeModal1();
                                        closeModal2();
                                    }} className="closeB col-5 ms-4 p-2">취소하기</button>
                                    <button type="button" className="deleteB col-5 me-4"
                                        onClick={() => {
                                            closeModal1();
                                            closeModal2();
                                            Ondelete();
                                        }}>삭제하기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>)
}