import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Roulette.css'; // 아래 작성해드린 CSS 파일 필요

export default function Roulette({ refreshPoint }) {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0); // 회전 각도 상태

    // 룰렛 판에 표시할 상품 목록 (현재는 시각적 효과용)
    const prizes = ["1000P", "꽝", "500P", "한번 더", "2000P", "꽝"];
    const segmentAngle = 360 / prizes.length; // 6개면 60도씩

    // 룰렛 돌리기 버튼 클릭 핸들러
    const handleSpin = async () => {
        if (spinning) return;

        // 1. 사용자 확인
        if (!window.confirm("🎫 룰렛 이용권 1장을 사용하여 돌리시겠습니까?")) {
            return;
        }

        setSpinning(true);

        try {
            // 2. 서버 통신 (이용권 차감 요청)
            // Backend Controller: @PostMapping("/point/roulette/start")
            await axios.post("/point/store/roulette/start");

            // 3. 성공 시 룰렛 회전 애니메이션 시작
            // (5바퀴 이상 회전 + 랜덤 각도)
            const randomDegree = Math.floor(Math.random() * 360); 
            const totalRotation = 360 * 5 + randomDegree + rotation; // 기존 각도에 누적

            setRotation(totalRotation);

            // 4. 회전이 멈춘 후 (3초 뒤) 결과 처리
            setTimeout(() => {
                setSpinning(false);
                
                // 결과 알림 (현재는 랜덤이지만, 추후 서버에서 당첨 결과를 받아오도록 수정 가능)
                toast.success("🎡 룰렛 종료! (이용권 차감 완료)");
                
                // 상단 포인트/인벤토리 정보 갱신 (부모 컴포넌트 함수 호출)
                if (refreshPoint) refreshPoint();

            }, 3000); // CSS transition 시간(3s)과 동일하게 설정

        } catch (error) {
            setSpinning(false);
            console.error(error);
            const msg = error.response?.data?.message || error.response?.data || "이용권이 부족하거나 오류가 발생했습니다.";
            toast.error(msg);
        }
    };

    return (
        <div className="roulette-container text-center py-5">
            <h3 className="mb-3 fw-bold text-primary">🎰 행운의 룰렛</h3>
            <p className="text-muted mb-4">
                인벤토리에 있는 <b>[룰렛 이용권]</b>을 사용하여 대박을 노려보세요!
            </p>

            <div className="wheel-wrapper">
                {/* 룰렛 화살표 (위쪽 고정) */}
                <div className="wheel-marker">▼</div>

                {/* 돌아가는 룰렛 판 */}
                <div 
                    className="wheel-board"
                    style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? "transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none"
                    }}
                >
                    {/* 섹션별 텍스트 배치 */}
                    {prizes.map((item, index) => (
                        <div 
                            key={index} 
                            className="wheel-segment"
                            style={{ 
                                // 각 섹션을 회전시켜 배치
                                transform: `rotate(${index * segmentAngle}deg)` 
                            }}
                        >
                            <div className="segment-text">{item}</div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                className={`btn btn-lg mt-5 rounded-pill px-5 fw-bold shadow-sm ${spinning ? 'btn-secondary' : 'btn-danger'}`}
                onClick={handleSpin}
                disabled={spinning}
            >
                {spinning ? "돌아가는 중..." : "GO! (이용권 1개 소모)"}
            </button>
        </div>
    );
}