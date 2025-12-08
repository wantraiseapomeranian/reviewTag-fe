import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom"

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function ContentsListByGenre() {
    //경로변수 장르 id
    const {genreName} = useParams();

    //contents 목록 state
    const [contentsList, setContentsList] = useState([]);

    //effect
    useEffect(()=>{
        if (genreName) {
            loadData();
        }
    }, [genreName]);

    //callback
    const loadData = useCallback(async ()=>{
        try {
            const response = await axios.get(`/api/tmdb/contents/list/${genreName}`);
            setContentsList(response.data);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        }
    }, []);

    //[포스터 이미지 url 생성 함수]
    const getPosterUrl = useCallback((path) => {
        return path ? 
            `${TMDB_IMAGE_BASE_URL}${path}` 
            : 
            'https://placehold.co/500x750/cccccc/333333?text=No+Image';
    }, []);


    return(<>
        <div className="row mt-4">
            <div className="col">
                <h2>{genreName} 부문 컨텐츠 </h2>
            </div>
        </div>
        <div className="row mt-4">
            {contentsList.length === 0 ? (
                    <div className="col">
                        <p>해당 장르의 콘텐츠가 없습니다.</p>
                    </div>
                ) : (
                    contentsList.map((content)=>(
                       <div className="col-3 mb-4" key={content.contentsId}>
                            <div className="card h-100 bg-dark text-white border-secondary">
                                <img 
                                    src={getPosterUrl(content.contentsPosterPath)} 
                                    className="card-img-top"
                                    alt={content.contentsTitle}
                                    style={{ height: "350px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title text-truncate">{content.contentsTitle}</h5>
                                    <p className="card-text">
                                        <small className="text-secondary">{content.contentsReleaseDate}</small>
                                        <br />
                                        <span className="badge bg-warning text-dark me-1">
                                            {content.contentsType}
                                        </span>
                                        {/* 장르 목록 표시 (collection으로 가져온 데이터) */}
                                        {content.genreNames && content.genreNames.map((g, index) => (
                                            <span key={index} className="badge bg-secondary me-1">
                                                {g}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
        </div>
    </>)
}