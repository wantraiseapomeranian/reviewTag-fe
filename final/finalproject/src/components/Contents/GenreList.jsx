import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./SearchAndSave.css"

export default function GenreList() {
    //장르 리스트 state
    const [genre, setGenre] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    //effect
    useEffect(()=>{
        loadData();
    }, []);

    useEffect(() => {
        // 현재 주소가 정확히 부모 경로('/contents/genreList')라면
        // 뒷부분에 슬래시(/)가 있거나 없거나 처리하기 위해 정규식이나 endsWith 사용 가능
        // 여기서는 가장 단순하게 경로 비교
        if (location.pathname === "/contents/genreList" || location.pathname === "/contents/genreList/") {
            // '전체' 목록 페이지로 이동 (replace: true는 뒤로가기 시 갇히는 것 방지)
            navigate("listByGenre/전체", { replace: true });
        }
    }, [location.pathname, navigate]);

    //callback
    const loadData = useCallback(async ()=>{
        const {data} = await axios.get("/api/tmdb/genre");
         // 전체 추가
    const genreList = [
        { genreId: 0, genreName: "전체" },
        ...data.map(g => ({ ...g }))
    ];
        setGenre(genreList);
    }, []);

    //render
    return(<>
        <div className="row genre-form">
            <div className="col p-4 rounded">
                    {/* <button className="btn me-2 mt-2"><Link to="/contents/genreList/listByGenre/전체" className="text-decoration-none link-body-emphasis">전체</Link></button> */}
                    {genre.map(genreDto=>(
                        <button className="btn me-2 mt-2" key={genreDto.genreId}>
                            <Link to={`/contents/genreList/listByGenre/${genreDto.genreName}`} className="genreLink" >
                            {genreDto.genreName}
                            </Link>
                        </button>
                    ))}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <Outlet/>
            </div>
        </div>
    </>)
}