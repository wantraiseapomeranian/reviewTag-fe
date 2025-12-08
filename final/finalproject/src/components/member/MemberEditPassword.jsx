import { FaAsterisk, FaEye, FaEyeSlash, FaUser } from "react-icons/fa6";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"


export default function MemberEditPassword(){
    //도구
    const {loginId} = useParams();
    const navigate = useNavigate();

    //state
    const [member, setMember] = useState({
        memberPw : "", memberPwCheck : ""
    });
    const [memberClass, setMemberClass] = useState({
        memberPw : "", memberPwCheck : ""
    });
    // 출력할 피드백
    const [memberPwFeedback, setMemberPwFeedback] = useState("");

    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev=>({...prev, [name]:value}))
    },[])

    
    // 비밀번호
    const checkMemberPw = useCallback(async(e)=>{
        //비밀번호 형식검사
        const regex = /^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+)(?=.*?[!@#$]+)[A-Za-z0-9!@#$]{8,16}$/;
        const valid = regex.test(member.memberPw);
        setMemberClass(prev=>({...prev,memberPw : valid ? "is-valid" : "is-invalid"}));
        //비밀번호 중복검사
        if(member.memberPw.length > 0){
            const valid2 = member.memberPw === member.memberPwCheck;
            setMemberClass(prev=>({...prev, memberPwCheck : valid2 ? "is-valid" : "is-invalid"}));
            setMemberPwFeedback("비밀번호 확인이 일치하지 않습니다")
        } else { // 비밀번호 미입력
            setMemberClass(prev =>({...prev, memberPwCheck : "is-invalid"}));
            setMemberPwFeedback("비밀번호는 필수 항목입니다")
        }
    },[member,memberClass])
    
        //비밀번호 숨김/표시
        const [showPassword, setShowPassword] = useState(false);


    //memo
    // 모든 항목이 유효한지 검사(선택항목은 is-invalid가 아니어야함)
    const memberValid = useMemo(()=>{
        if(memberClass.memberPw !== "is-valid") return false;
        if(memberClass.memberPwCheck !== "is-valid") return false;
        return true;
    },[memberClass])

    //callback
    //최종 수정
    const sendData = useCallback(async()=>{
        if(memberValid === false) return ;
        const {data} = await axios.put(`/member/password/${loginId}`,member);
        navigate(`/member/mypage/myinfo/${loginId}`); // 메인페이지
    },[member,memberValid])


    //render
    return (<>
        <h2>비밀번호 변경</h2>


        {/* 비밀번호 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                    비밀번호<FaAsterisk className="text-danger"/>
                {showPassword === true ? (
                        <FaEye className="ms-2" onClick={e=>setShowPassword(false)}/>
                    ) : (
                        <FaEyeSlash className="ms-2"onClick={e=>setShowPassword(true)}/>
                    ) }
            </label>
            <div className="col-sm-9">
                <input type={showPassword===true ? "text" : "password"} className={`form-control ${memberClass.memberPw}`} 
                            name="memberPw" value={member.memberPw}
                            onChange={changeStrValue}
                            onBlur={checkMemberPw}
                            />
                <div className="valid-feedback">사용 가능한 비밀번호입니다</div>
                <div className="invalid-feedback">대/소문자, 숫자, 특수문자를 반드시 1개 포함하여 8~16자로 작성하세요</div>
            </div>
        </div>
        {/* 비밀번호 확인 */}
        <div className="row mt-1">
            <label className="col-sm-3 col-form-label"></label>
            <div className="col-sm-9">
                <input type={showPassword===true ? "text" : "password"}  className={`form-control ${memberClass.memberPwCheck}`} 
                            name="memberPwCheck" value={member.memberPwCheck}
                            onChange={changeStrValue}
                            onBlur={checkMemberPw}
                            />
                <div className="valid-feedback">비밀번호가 일치합니다</div>
                <div className="invalid-feedback">{memberPwFeedback}</div>
            </div>
        </div>
        
        {/* 수정버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-success w-100"
                            disabled={memberValid === false}
                            onClick = {sendData}
                            >
                <FaUser className="me-2"/>
                <span>비밀번호 변경</span>
                </button>
            </div>
        </div>


    </>)
}