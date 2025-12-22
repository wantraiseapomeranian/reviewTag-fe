import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAtomValue } from "jotai";
import { loginIdState, pointRefreshAtom } from "../../utils/jotai"; 
import "./StoreProfile.css"; 

export default function StoreProfile({ refreshTrigger }) {
    const loginId = useAtomValue(loginIdState);
    const pointRefresh = useAtomValue(pointRefreshAtom); // 전역 새로고침 신호 감지
    
    const [userInfo, setUserInfo] = useState({
        nickname: "",
        point: 0,
        level: "",
        iconSrc: null,
        nickStyle: "",
        frameSrc: "", // frame-gold, frame-fire 등
        bgSrc: ""     // bg-ice, bg-fallout 등
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!loginId) return;
        
        setLoading(true);
        axios.get("/point/main/store/my-info")
            .then(res => {
                if (res.data) setUserInfo(res.data);
            })
            .catch(err => console.error("프로필 데이터 로드 실패:", err))
            .finally(() => setLoading(false));
            
    }, [loginId, refreshTrigger, pointRefresh]); // 구매/장착 신호 발생 시 자동 재로드

    if (!loginId) return null;

    // 데이터 로딩 중이거나 닉네임이 없을 때 틀이 깨지지 않게 처리
    const isReady = userInfo.nickname || !loading;

    return (
        <div className="store-profile-wrapper">
            {/* 배경(bgSrc)과 프레임(frameSrc) 클래스를 동시에 동적 바인딩 */}
            <div className={`membership-card ${userInfo.bgSrc || ""} ${userInfo.frameSrc || ""} ${!isReady ? 'loading' : ''}`}>
            {/* <div className={`membership-card ${userInfo.bgSrc || ""}  ${!isReady ? 'loading' : ''}`}> */}
                
                {!isReady ? (
                    <div className="loading-box">
                        <span className="loading-text">Member Information Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* 왼쪽: 아바타 및 유저 정보 */}
                        <div className="card-user-info">
                            <div className="card-avatar-box">
                                {userInfo.iconSrc ? (
                                    <img src={userInfo.iconSrc} alt="avatar" className="card-avatar-img" />
                                ) : (
                                    <div className="default-avatar">👤</div>
                                )}
                            </div>
                            
                            <div className="card-text-group">
                                <div className={`card-nickname ${userInfo.nickStyle || ""}`}>
                                    {userInfo.nickname || loginId}
                                </div>
                                <div className="card-grade">
                                    <span className={`badge-level ${userInfo.level === '관리자' ? 'admin' : ''}`}>
                                        👑 {userInfo.level || "MEMBER"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 포인트 정보 */}
                        <div className="card-point-wallet">
                            <span className="wallet-label">CURRENT BALANCE</span>
                            <div className="wallet-amount">
                                {userInfo.point?.toLocaleString() || 0}
                                <span className="currency-unit">P</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}