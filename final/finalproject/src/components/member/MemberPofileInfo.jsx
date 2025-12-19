import { Link, useParams } from "react-router-dom"
import "./Member.css"
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaGift } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { toast } from "react-toastify";

export default function MemberProfileInfo() {
    
    const loginId = useAtomValue(loginIdState);
    
    const { memberId } = useParams();

    const [profile, setProfile] = useState({});
    const [showDonate, setShowDonate] = useState(false);
    // ★ 포인트 갱신 트리거 (하위 컴포넌트에서 포인트 변동 시 호출)
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 포인트 갱신 함수 (StoreView, Roulette 등에 전달)
    const refreshAll = useCallback(() => {
        setRefreshTrigger(prev => prev + 1); // 이 값이 변하면 StoreProfile이 다시 로딩됨
    }, []);

    const loadData = useCallback(async () => {
        const {data} = await axios.get(`/member/profile/${memberId}`);
        setProfile(data);
    }, [memberId]);
    
    useEffect(()=>{
        loadData();
    }, [loadData]);
    
    const formattedDate = useMemo(()=>{
        if (!profile || !profile.memberJoin) return "";
        const date = profile.memberJoin;
        return date.substring(0, 16);
    }, [profile]);

    //신뢰도 레벨
    const rel = profile?.memberReliability ?? 0;

    const relRowLevel = useMemo(() => {
        return rel >= 6 && rel <= 19;
    }, [rel])

    const relMiddleLevel = useMemo(() => {
        return rel >= 20 && rel <= 49;
    }, [rel])

    const relHighLevel = useMemo(() => {
        return rel >= 50;
    }, [rel])

    return (<>
        <h1 className="text-center mt-4"> {profile.memberNickname}님의 정보</h1>

        <div className="mypage-table-wrapper">
            <table className="table table-hover mypage-table">
                <tbody>
                     <tr>
                        <td>아이디</td>
                        <td>{profile.memberId}</td>
                    </tr>
                    <tr>
                       <td>닉네임</td> 
                        <td>
                            <span>{profile.memberNickname}</span>
                            {relRowLevel && (
                                <span className="Rel ms-3">🟢 활동 리뷰어</span>
                            )}
                            {relMiddleLevel && (
                                <span className="Rel2 ms-3">🔵 신뢰 리뷰어</span>
                            )}
                            {relHighLevel && (
                                <span className="Rel2 ms-3">🔷 검증된 리뷰어 </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>등급</td>
                        <td>{profile.memberLevel}</td>
                    </tr>
                    <tr>
                        <td>가입일</td>
                        <td>{formattedDate}</td>
                    </tr>
                    <tr>
                        <td>신뢰도</td>
                        <td>{profile.memberReliability}</td>
                    </tr>

                </tbody>
            </table>
            <div className="row mt-2">
                <div className="col text-end">
                    <button onClick={() => setShowDonate(true)} 
                        className="btn warning me-2">
                        <FaGift className="me-2 mb-1"/>선물하기
                    </button>
                </div>
            </div>
            {/* 후원 모달 */}
            {showDonate && 
                <Donate closeModal={() => setShowDonate(false)} 
                    onSuccess={() => { refreshAll(); toast.success("후원 완료! 🎁"); }} />}
        </div>

    </>)
}