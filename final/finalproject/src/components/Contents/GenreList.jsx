import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom";

export default function GenreList() {
    //장르 리스트 state
    const [genre, setGenre] = useState([]);

    //effect
    useEffect(()=>{
        loadData();
    }, []);

    //callback
    const loadData = useCallback(async ()=>{
        const {data} = await axios.get("/api/tmdb/genre");
        const genreList = data.map(genre=>({
            ...genre,
        }));
        setGenre(genreList);
    }, []);

    //render
    return(<>
        <div className="row">
            <div className="col">
                <ul className="list-group">
                    {genre.map(genreDto=>(
                        <li className="list-group-item" key={genreDto.genreId}>
                            <Link to={`/contents/listByGenre/${genreDto.genreName}`}>
                            {genreDto.genreName}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </>)
}