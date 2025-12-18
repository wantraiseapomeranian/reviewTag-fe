import React, { useEffect, useState, useCallback } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";

// props로 setTab, refreshPoint(포인트 갱신 함수) 받음
export default function DailyQuest({ setTab, refreshPoint }) {
    const loginId = useAtomValue(loginIdState);
    const [quests, setQuests] = useState([]);
    const [timeLeft, setTimeLeft] = useState("");

    // 1. 자정까지 남은 시간 계산
    const calculateTimeLeft = useCallback(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); 
        const diff = midnight - now;

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, []);

    // 2. 타이머 갱신
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    // 3. 퀘스트 목록 로드
    const loadQuests = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/quest/list");
            setQuests(resp.data);
        } catch (e) { console.error("퀘스트 로드 실패", e); }
    }, [loginId]);

    useEffect(() => { loadQuests(); }, [loadQuests]);

    // 4. 바로가기/퀴즈 클릭 처리
    const handleQuestClick = async (quest) => {
        if (quest.done) return;

        // [퀴즈 처리]
        if (quest.action === "quiz") {
            try {
                // 1. 랜덤 문제 가져오기
                const resp = await axios.get("/point/quest/quiz/random");
                
                // 만약 오늘 이미 풀었다면 null이 올 수 있음
                if(!resp.data) {
                    toast.info("오늘의 퀴즈를 이미 완료하셨습니다.");
                    return;
                }

                // ▼▼▼ [중요 수정] quizNo를 받아옵니다.
                const { quizNo, quizQuestion } = resp.data;

                // 2. 사용자 입력 받기
                const userAnswer = window.prompt(`[영화/애니 퀴즈]\n\n${quizQuestion}`);
                if (!userAnswer) return;

                // 3. 정답 확인 요청 (quizNo와 answer 전송)
                const checkResp = await axios.post("/point/quest/quiz/check", { 
                    quizNo: quizNo,         // <--- [핵심] 문제 번호를 보내야 서버가 채점함
                    answer: userAnswer 
                });

                if (checkResp.data === "success") {
                    toast.success("🎉 정답입니다! 퀘스트가 완료되었습니다.");
                    loadQuests(); // 목록 갱신
                } else {
                    toast.error("오답입니다! 다시 시도해보세요.");
                }
            } catch (e) {
                console.error(e);
                toast.error("퀴즈를 불러오거나 제출하는 중 오류가 발생했습니다.");
            }
        } 
        // [룰렛 이동]
        else if (quest.action === "roulette") {
            setTab("roulette");
            toast.info("🎰 룰렛 탭으로 이동합니다!");
        } 
        // [좋아요 - 게시판 이동]
        else if (quest.type === "LIKE") {
            toast.info("게시판으로 이동합니다. 좋아요를 눌러보세요!");
            window.location.href = "/board/list";
        } 
        // [리뷰 - 전체 목록 이동]
        else if (quest.type === "REVIEW") {
            toast.info("리뷰 작성을 위해 전체 리스트로 이동합니다!");
            window.location.href = "/contents/genreList/listByGenre/전체";
        }
    };

    // 5. 보상 받기
    const handleClaim = async (type) => {
        try {
            const resp = await axios.post("/point/quest/claim", { type: type });
            if (resp.data.startsWith("success")) {
                const reward = resp.data.split(":")[1];
                toast.success(`보상이 지급되었습니다! +${reward}P 💰`);
                
                // 1. 퀘스트 목록 갱신 (버튼 상태 변경)
                loadQuests(); 
                
                // 2. 상단 포인트 갱신 (부모에서 받은 함수 실행)
                if(typeof refreshPoint === 'function') {
                    refreshPoint();
                } else {
                    // 혹시 함수가 안 넘어왔을 때를 대비한 백업
                    window.dispatchEvent(new CustomEvent("pointChanged"));
                }

            } else {
                toast.warning(resp.data.split(":")[1]);
            }
        } catch (e) { toast.error("보상 수령 실패"); }
    };

    return (
        <div className="quest-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">📜 일일 퀘스트</h5>
                <span className="badge bg-dark border border-secondary text-warning" style={{fontSize:'0.8rem', fontFamily:'monospace'}}>
                    ⏳ Reset {timeLeft}
                </span>
            </div>

            <div className="quest-list">
                {quests.map((q, index) => (
                    <div key={q.type || index} className={`quest-item ${q.done ? 'done-bg' : ''}`}>
                        <div className="d-flex align-items-center">
                            <div className="quest-icon-box me-3">{q.icon}</div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className={`quest-title ${q.done ? 'text-decoration-line-through text-muted' : ''}`}>{q.title}</span>
                                    <span className="quest-reward text-warning fw-bold small">+{q.reward} P</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-end">
                                    <small className="text-secondary me-2" style={{fontSize:'0.8rem'}}>{q.desc}</small>
                                    
                                    {q.claimed ? (
                                        <span className="text-muted small">완료</span>
                                    ) : q.done ? (
                                        <button className="btn btn-xs btn-primary py-0 px-2 fw-bold" style={{fontSize:'0.75rem'}} onClick={() => handleClaim(q.type)}>받기</button>
                                    ) : (
                                        <span className="text-neon-mint small fw-bold">{q.current} / {q.target}</span>
                                    )}
                                </div>
                                <div className="progress mt-2" style={{height: '4px', backgroundColor: '#333'}}>
                                    <div className="progress-bar" style={{width: `${Math.min((q.current / q.target) * 100, 100)}%`, backgroundColor: q.done ? '#00d2d3' : '#e50914'}}></div>
                                </div>
                            </div>
                            {!q.done && (
                                <button className="btn btn-link text-secondary p-0 ms-2" onClick={() => handleQuestClick(q)} title="바로가기">🚀</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}