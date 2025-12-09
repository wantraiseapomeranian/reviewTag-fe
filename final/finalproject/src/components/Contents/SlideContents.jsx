import axios from "axios";
import { useCallback, useState } from "react"

export default function SlideContents() {
    //state
    const [tvList, setTvList] = useState();
    const [movieList, setMovieList] = useState();
    const [isLoading, setIsLoading] = useState(false);

    //callback
    const loadTVData = useCallback(async ()=>{
        setIsLoading(true);
        try {
            const response = await axios.get("/api/tmdb/list/type/tv", { params: { page: page } });
        }
        catch (error) {
            console.log("에러발생 : ", error);
        }
        

    }, []);
    const loadMovieData = useCallback(async ()=>{}, []);
    
    return (<>
    
    </>)
}