import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { loginIdState } from "../../utils/jotai";
import axios from "axios";
import './AdminQuiz.css'; // CSS 임포트
import AdminReviewCard from "./AdminReviewCard";


export default function AdminReviewReport(){
    //state
        const loginId = useAtomValue(loginIdState);
        const [loading, setLoading] = useState(false);
        const [currentTab, setCurrentTab] = useState('active'); 
        const [reviewList, setReviewList] = useState([]);

    // 데이터 로딩함수
    const loadData = useCallback(async()=>{
        setLoading(false);
        if(!loginId) return;
        try{
            const {data} = await axios.get(`/review/report/list`);
            console.log(data);
            setReviewList(data);
        }
        catch(err){
            console.log(err);
        }

    },[loginId]);
    
    useEffect(() => {
        if (loginId) {
            loadData();
        }
    }, [loginId]);


        return (
            <div className="admin-quiz-container">
                
                {/* 1. 헤더 영역 */}
                <div className="admin-page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <h3 className="admin-title mb-0">
                        리뷰 신고 관리
                    </h3>
                </div>

    
                {/* 3. 리스트 영역 */}
                <div className="mt-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">데이터를 불러오는 중입니다...</p>
                        </div>
                    ) : (
                       <>
                            {reviewList.length === 0 ? (
                                // [수정] style 속성 제거 (CSS에서 width: 100% 줬으므로)
                                <div className="empty-state-box">
                                    <div className="empty-icon">✨</div>
                                    <h5>데이터가 없습니다.</h5>
                                    <p>접수된 신고가 없거나 처리할 항목이 없습니다.</p>
                                </div>
                            ) : (
                                // [수정] 데이터가 있을 때만 그리드 레이아웃 적용
                                <div className="quiz-list-grid">
                                    {reviewList.map(review => (
                                        <AdminReviewCard 
                                            key={review.reviewId} 
                                            quizData={review} 
                                            refreshList={loadData} 
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
