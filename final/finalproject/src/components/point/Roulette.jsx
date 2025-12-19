import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Swal from 'sweetalert2';
import './Roulette.css'; 

export default function Roulette({ refreshPoint, setTab }) { // setTab 프롭스 추가
    const loginId = useAtomValue(loginIdState);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [ticketCount, setTicketCount] = useState(0);

    const TICKET_ITEM_TYPE = "RANDOM_ROULETTE"; 

    // [중요] 백엔드 PointService.playRoulette 로직과 인덱스 동기화
    const items = [
        { name: "1000 P", value: 1000, icon: "💰" },
        { name: "다음 기회에", value: 0, icon: "😢" },
        { name: "꽝", value: 0, icon: "❌" },
        { name: "꽝", value: 0, icon: "❌" },
        { name: "2000 P", value: 2000, icon: "💎" },
        { name: "다음 기회에", value: 0, icon: "😢" },
    ];

    // 1. 내 인벤토리에서 이용권 개수 조회
    const loadTicketCount = useCallback(async () => {
        if (!loginId) return;
        try {
            const resp = await axios.get("/point/main/store/inventory/my");
            // 티켓 아이템 필터링 및 수량 합산
            const tickets = resp.data.filter(item => item.pointItemType === TICKET_ITEM_TYPE);
            const total = tickets.reduce((acc, curr) => acc + curr.inventoryQuantity, 0);
            setTicketCount(total);
        } catch (e) {
            console.error("티켓 조회 실패", e);
        }
    }, [loginId]);

    useEffect(() => {
        loadTicketCount();
    }, [loadTicketCount]);

    // 2. 룰렛 돌리기 핸들러
    const handleSpin = async () => {
        if (isSpinning) return;
        if (ticketCount <= 0) {
            toast.warning("🎟️ 룰렛 이용권이 없습니다. 상점에서 구매해주세요!");
            return;
        }

        // Swal 확인창 (황금빛 테마 적용)
        const confirmResult = await Swal.fire({
            title: 'LUCKY SPIN!',
            text: `이용권 1장을 사용하여 룰렛을 돌리시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#444',
            confirmButtonText: '돌리기',
            cancelButtonText: '취소',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (!confirmResult.isConfirmed) return;

        setIsSpinning(true);

        try {
            // 백엔드: playRoulette 실행 (결과 인덱스 0~5 반환)
            const resp = await axios.post("/point/main/store/roulette");
            const resultIndex = resp.data; 

            // 애니메이션 각도 계산 (이전 각도에서 누적하여 계속 회전)
            const segmentAngle = 360 / 6; 
            const additionalSpins = 360 * 10; // 10바퀴 회전 효과
            
            // 핀이 12시에 있으므로, 360 - (인덱스 * 각도)를 더해 정확한 지점에 멈춤
            const targetRotation = rotation + additionalSpins + (360 - (resultIndex * segmentAngle)) - (rotation % 360);

            setRotation(targetRotation);

            // 3. 결과 표시 (애니메이션 4초 후 실행)
            setTimeout(async () => {
                const winItem = items[resultIndex];
                
                if (winItem.value > 0) {
                    await Swal.fire({
                        title: `🎊 당첨을 축하합니다!`,
                        html: `<div style="font-size: 1.2rem; margin-bottom: 10px;">결과: <b>${winItem.name}</b></div>
                               <div style="color: #f1c40f;">${winItem.value} 포인트가 지급되었습니다!</div>`,
                        icon: 'success',
                        background: '#1a1a1a',
                        color: '#fff',
                        confirmButtonColor: '#f1c40f',
                        backdrop: `rgba(0,0,0,0.6) url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXpueG94bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbMubM4/giphy.gif") center center no-repeat`
                    });
                } else {
                    await Swal.fire({
                        title: `아쉬워요!`,
                        text: `결과: ${winItem.name}`,
                        icon: 'info',
                        background: '#1a1a1a',
                        color: '#fff',
                        confirmButtonColor: '#3498db'
                    });
                }
                
                setIsSpinning(false);
                loadTicketCount(); // 티켓 수량 즉시 업데이트
                if (refreshPoint) refreshPoint(); // 상단 바 포인트 즉시 업데이트
            }, 4000);

        } catch (e) {
            console.error(e);
            toast.error("룰렛 서버 통신 중 오류가 발생했습니다.");
            setIsSpinning(false);
        }
    };

    return (
        <div className="roulette-wrapper">
            <div className="roulette-glass-card">
                <h2 className="roulette-title">🎰 LUCKY SPIN</h2>
                <p className="roulette-subtitle">이용권을 사용하여 행운을 잡으세요!</p>
                
                <div className="ticket-status-box">
                    <div className="ticket-badge">
                        🎟️ 보유 이용권: <b>{ticketCount}</b>장
                    </div>
                </div>

                <div className="wheel-outer">
                    {/* 삼각형 지시계 */}
                    <div className="wheel-indicator">▼</div>
                    
                    <div 
                        className="wheel-main"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
                        }}
                    >
                        {items.map((item, index) => (
                            <div key={index} className={`wheel-sec sec-${index}`}>
                                <div className="sec-content">
                                    <span className="sec-icon">{item.icon}</span>
                                    <span className="sec-text">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 룰렛 중앙 고정 핀 */}
                    <div className="wheel-center-pin">GO</div>
                </div>

                <div className="spin-action-area">
                    <button 
                        className={`btn-spin-glass ${ticketCount === 0 ? 'no-ticket' : ''}`}
                        onClick={handleSpin}
                        disabled={isSpinning || ticketCount === 0}
                    >
                        {isSpinning ? "행운을 비는 중..." : ticketCount > 0 ? "지금 돌리기" : "이용권이 부족합니다"}
                    </button>
                    
                    {ticketCount === 0 && !isSpinning && (
                        <div className="shop-link-hint" onClick={() => setTab('store')}>
                            🍿 상점에서 룰렛 이용권 구매하기 ➔
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}