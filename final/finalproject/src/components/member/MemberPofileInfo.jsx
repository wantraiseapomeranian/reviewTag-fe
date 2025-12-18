import { Link, useParams } from "react-router-dom"
import "./Member.css"
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaGift } from "react-icons/fa";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Donate from "../Point/Donate";
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

    return (<>
        <h1 className="text-center mt-4"> {profile.memberId}님의 정보</h1>

        <div className="mypage-table-wrapper">
            <table className="table table-hover mypage-table">
                <tbody>
                    <tr>
                        <td>닉네임</td>
                        <td>{profile.memberNickname}</td>
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