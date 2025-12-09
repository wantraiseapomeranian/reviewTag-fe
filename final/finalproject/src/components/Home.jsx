import { useCallback, useEffect, useState } from "react";




export default function Home() {

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

    return(<>
        <div className="row mt-4">
            <div className="col">
                <h1>홈 화면</h1>
                <p>환영합니다!</p>
            </div>
        </div>
    </>)
}