import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./SearchAndSave.css";
import "./Contents.css";
import { FaSearch } from "react-icons/fa";

export default function GenreList() {
    //장르 리스트 state
    const [genre, setGenre] = useState([]);
    //검색어 state
    const [query, setQuery] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    //effect
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (location.pathname === "/contents/genreList" || location.pathname === "/contents/genreList/") {
            // '전체' 목록 페이지로 이동 (replace: true는 뒤로가기 시 갇히는 것 방지)
            navigate("listByGenre/전체", { replace: true });
        }
    }, [location.pathname, navigate]);

    //callback
    const loadData = useCallback(async () => {
        const { data } = await axios.get("/api/tmdb/genre");
        // 전체 추가
        const genreList = [
            { genreId: 0, genreName: "전체" },
            ...data.map(g => ({ ...g }))
        ];
        setGenre(genreList);
    }, []);

    //[입력창 제어 및 검색이동]
    const handleSearch = useCallback(() => {
        if (query.trim().length === 0) return;
        // 검색어와 함께 결과 페이지로 이동
        navigate(`/contents/searchResult/${query}`);
        setQuery(""); // 입력창 비우기 (선택사항)
    }, [query, navigate]);


    //render
    return (<>
        <div className="container mt-2">

            {/* 검색영역 */}
            <div className="row justify-content-center">
                <div className="col-12 col-md-5 d-flex text-nowrap">
                    <div className="mt-3 input-group search-wrapper">
                        {/* 검색창 */}
                        <input type="text" className="search form-control search-bar text-light" value={query}
                            placeholder="제목" onChange={e => setQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} />
                        {/* 검색 버튼 */}
                        <button className="search btn btn-success" onClick={handleSearch}
                        >
                            <FaSearch className="fs-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mt-4 genre-form">
                <div className="col p-4 rounded">
                    {genre.map(genreDto => (
                        <div className="btn me-2 mt-2" key={genreDto.genreId}>
                            <Link to={`/contents/genreList/listByGenre/${genreDto.genreName}`} className="genreLink" >
                                {genreDto.genreName}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <Outlet />
            </div>
        </div>
    </>)
}