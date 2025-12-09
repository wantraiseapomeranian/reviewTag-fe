import axios from "axios";
// 1. useSearchParams 대신 useParams를 가져옵니다.
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaQuestion, FaSearch } from "react-icons/fa";
import { FaBookmark, FaPencil } from "react-icons/fa6";
import { RiArrowGoBackFill } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom"; // useParams import
import "./SearchAndSave.css";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const INITIAL_DETAIL = {
    contentsId: null, contentsTitle: "", contentsType: "",
    contentsOverview: "", contentsPosterPath: "", contentsBackdropPath: "",
    contentsVoteAverage: 0, contentsRuntime: 0, contentsReleaseDate: "",
    contentsDirector: "", contentsMainCast: "", genreNames: [],
};

export default function SearchResult() {
    
    // 2. [수정] URL 경로에 있는 변수(:query)를 꺼내옵니다.
    const { query } = useParams(); 

    const [resultList, setResultList] = useState([]);
    const [contentsDetail, setContentsDetail] = useState(INITIAL_DETAIL);
    const [isSelect, setIsSelect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const navigate = useNavigate();

    // 3. [수정] 검색 함수 로직 수정
    const handleSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length === 0) return;

        setIsLoading(true);
        setStatusMessage("TMDB에서 컨텐츠 검색 중..");
        setResultList([]);

        try {
            // ★ 중요: 파라미터 이름을 명확하게 지정해야 합니다.
            // { params: { query } } 라고 쓰면 상단의 const query를 참조할 수 있어 위험합니다.
            // 인자로 받은 searchQuery를 사용하도록 수정했습니다.
            const response = await axios.get("/api/tmdb/search", { 
                params: { query: searchQuery } 
            });
            
            setResultList(response.data);

            if (response.data.length === 0) {
                setStatusMessage(`"${searchQuery}" 와 일치하는 검색 결과를 찾을 수 없습니다.`);
            } else {
                setStatusMessage(`"${searchQuery}" 에 대한 검색 결과 : ${response.data.length} 개`);
            }
        } catch (error) {
            console.error("오류발생 : ", error);
            setStatusMessage("검색 중 서버 오류 발생");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 4. query가 변경될 때마다 검색 실행
    useEffect(() => {
        if (query) {
            handleSearch(query);
            setIsSelect(false);
        }
    }, [query, handleSearch]);

    // [컨텐츠 선택 및 DB저장]
    const handleSelectAndSave = useCallback(async (contents) => {
        setIsLoading(true);
        setIsSelect(true);
        try {
            const response = await axios.post("/api/tmdb/save", {
                contentsId: contents.contentsId,
                type: contents.type
            });
            setContentsDetail(response.data);
            setIsSelect(true);
        } catch (error) {
            console.error("저장 API 오류 : ", error);
            setIsSelect(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const writeReview = useCallback(() => {
        if (!isLoading && contentsDetail.contentsId) {
            navigate(`/review/write/${contentsDetail.contentsId}`);
        }
    }, [navigate, isLoading, contentsDetail.contentsId]);

    const getPosterUrl = useCallback((path) => {
        return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);

    // 상세정보 초기화 Effect
    useEffect(() => {
        if (!isSelect) {
            setContentsDetail(INITIAL_DETAIL);
        }
    }, [isSelect]);

    // Memoized Values
    const renderGenres = useMemo(() => {
        if (!contentsDetail.genreNames || contentsDetail.genreNames.length === 0) {
            return <span className="text-light">장르 정보 없음</span>;
        }
        return contentsDetail.genreNames.map((name, index) => (
            <span key={index} className="text-light me-1">{name}</span>
        ));
    }, [contentsDetail.genreNames]);

    const formattedDate = useMemo(() => {
        if (!contentsDetail.contentsReleaseDate) return "";
        return contentsDetail.contentsReleaseDate.split(" ")[0];
    }, [contentsDetail.contentsReleaseDate]);

    return (
        <div className="container">
            {/* 리스트 화면 */}
            {!isSelect && (
                <div>
                    <div className="row mt-5">
                        <div className="col">
                            {/* 상태 메시지 글자색이 안 보여서 text-light 추가 */}
                            <p className="text-light">{statusMessage}</p> 
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {resultList.length > 0 ? (
                                resultList.map(result => (
                                    <div className="simple-item" key={result.contentsId} onClick={() => handleSelectAndSave(result)}>
                                        <div className="d-flex align-items-center">
                                            <img src={getPosterUrl(result.posterPath)}
                                                alt={result.title}
                                                style={{ width: "60px", height: "85px", objectFit: "cover", borderRadius: "4px" }}
                                                className="me-3" />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="text-light fw-bold text-truncate">{result.title}</div>
                                                <div className="text-light small">
                                                    {result.type} • {result.releaseDate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-light">검색 결과를 기다리는 중...</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 상세정보 화면 */}
            {isSelect && (
                <div className="row p-3 dark-bg-wrapper shadow rounded text-light mt-4">
                    {!isLoading && contentsDetail.contentsId ? (
                        <>
                            <div className="text-end">
                                <span className="badge bg-danger px-3 py-2 btn me-3"><h5><FaBookmark /></h5></span>
                                <button onClick={() => setIsSelect(false)} className="btn btn-warning px-3 py-2"><h5><RiArrowGoBackFill /></h5></button>
                            </div>
                            <div className="col-4 col-sm-3 p-4 black-bg-wrapper text-light rounded">
                                <img src={getPosterUrl(contentsDetail.contentsPosterPath)} style={{ height: "350px", objectFit: "cover" }}
                                    alt={`${contentsDetail.contentsTitle} 포스터`} className="text-center w-100" />
                                <div className="mt-3">
                                    <span>{contentsDetail.contentsType} • {contentsDetail.contentsRuntime} 분</span>
                                    <div>장르 : {renderGenres}</div>
                                    <div>방영일 : {formattedDate}</div>
                                    <div>평점 : {contentsDetail.contentsVoteAverage.toFixed(1)} / 10</div>
                                </div>
                            </div>
                            <div className="col-7 col-sm-8 ms-4 mt-2">
                                <h3>{contentsDetail.contentsTitle}</h3>
                                <div className="mt-4">
                                    <h5>줄거리</h5>
                                    <span className="break-word">{contentsDetail.contentsOverview}</span>
                                </div>
                                {/* 감독, 주연 등 나머지 정보 표시 */}
                                <div className="mt-3">
                                    <h5>감독</h5>
                                    <p>{contentsDetail.contentsDirector}</p>
                                </div>
                                <div className="mt-3">
                                    <h5>주연</h5>
                                    <p>{contentsDetail.contentsMainCast}</p>
                                </div>

                                <div className="text-end mb-3 mt-4">
                                    <button className="btn btn-success" onClick={writeReview}><FaPencil className="mb-1 me-1" />리뷰등록</button>
                                    <button className="btn btn-warning ms-2"><FaQuestion className="mb-1 me-1" /> 퀴즈</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-5">
                            <h3>상세 정보를 불러오는 중...</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}