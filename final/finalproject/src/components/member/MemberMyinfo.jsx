import { useAtom, useSetAtom } from "jotai"
import { clearLoginState, loginIdState, loginLevelState } from "../../utils/jotai"
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Member.css";
import { Link, useNavigate, useParams } from "react-router-dom";



export default function MemberMyinfo(){
    const {loginId} = useParams();
    const [memberData, setMemberData] = useState({});
        const clearLogin = useSetAtom(clearLoginState);
    const navigate = useNavigate();
    //effect
    useEffect(()=>{
        if(loginId === null) return;
        axios.get(`/member/mypage/${loginId}`)
        .then(response=>{
            setMemberData(response.data);
        })
    },[]);

    //callback
    const deleteMember = useCallback(async()=>{
        const choice = window.confirm("정말 탈퇴하시겠습니까?");
        if(choice === false) return;

        await axios.delete(`/member/${loginId}`);
        navigate("/");
        clearLogin();
    })
    return(<>
        <h1 className="text-center"> {loginId}님의 정보</h1>

        <div className="mypage-table-wrapper">
        <table className="table table-hover mypage-table">
            <tbody>
                <tr>
                    <td>아이디</td>
                    <td>{memberData.memberId}</td>
                </tr>
                <tr>
                    <td>닉네임</td>
                    <td>{memberData.memberNickname}</td>
                </tr>
                 <tr>
                    <td>등급</td>
                    <td>{memberData.memberLevel}</td>
                </tr>
                <tr>
                    <td>생년월일</td>
                    <td>{memberData.memberBirth}</td>
                </tr>
                <tr>
                    <td>전화번호</td>
                    <td>{memberData.memberContact}</td>
                </tr>
                                <tr>
                    <td>이메일</td>
                    <td>{memberData.memberEmail}</td>
                </tr>
                <tr>
                    <td>포인트</td>
                    <td>{memberData.memberPoint}</td>
                </tr>
            </tbody>
        </table>
        <div className="row mt-2">
            <div className="col">
                    <Link to={`/member/mypage/edit/${loginId}`} className="btn btn-secondary me-2">기본정보 수정</Link>
                    <Link to={`/member/mypage/password/${loginId}`} className="btn btn-secondary me-2">비밀번호 변경</Link>
                    <div className="btn btn-danger" onClick={deleteMember}>탈퇴</div>
            </div>
        </div>
        </div>

    </>)
}