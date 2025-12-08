import { FaAsterisk, FaEraser, FaEye, FaEyeSlash, FaKey, FaMagnifyingGlass, FaPaperPlane, FaSpinner, FaUser } from "react-icons/fa6";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
//Daum 우편번호/주소검색 API
import { useDaumPostcodePopup } from 'react-daum-postcode';

export default function member(){

    const {loginId} = useParams();

    //도구
    const navigate = useNavigate();

    //state
    const [member, setMember] = useState({
        memberId : "", memberPw : "", memberPwCheck : "", memberNickname : "",
        memberEmail : "", memberBirth : "", memberContact : "",
        memberPost : "", memberAddress1 : "", memberAddress2 : ""
    });
    const [memberClass, setMemberClass] = useState({
        memberEmail : "is-valid", memberBirth : "is-valid", memberContact : "is-valid",
        memberPost : "is-valid", memberAddress1 : "is-valid", memberAddress2 : "is-valid"
    });
    const [certNumber, setCertNumber] = useState("");
    const [certNumberClass, setCertNumberClass] = useState("");

    // 출력할 피드백
    const [memberPwFeedback, setMemberPwFeedback] = useState("");
    const [memberEmailFeedback, setMemberEmailFeedback] = useState("");
    const [certNumberFeedback, setCertNumberFeedback] = useState("");
    
    useEffect(()=>{
        if(loginId === null) return;
        axios.get(`/member/mypage/${loginId}`)
        .then(response=>{
            setMember(response.data);  
        })
    },[]);

    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev=>({...prev, [name]:value}))
    },[])

    const changeDateValue = useCallback((date)=>{
        // → 별도의 포맷 전환 절차가 필요
        const replacement = format(date,"yyyy-MM-dd");
        setMember(prev=>({...prev, memberBirth : replacement}));
    },[]);


    //생년월일
        const checkMemberBirth = useCallback(e=>{
            const regex = /^(19[0-9]{2}|20[0-9]{2})-((02-(0[1-9]|1[0-9]|2[0-9]))|((0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30))|((0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01])))$/
            const valid = member.memberContact.length === 0 || regex.test(member.memberBirth); 
            setMemberClass({...memberClass, memberBirth : valid ? "is-valid" : "is-invalid"});
        },[member, memberClass])

    //연락처
        const checkMemberContact = useCallback(e=>{
            const regex = /^010[1-9][0-9]{7}$/
            const valid = member.memberContact.length === 0 || regex.test(member.memberContact); 
            setMemberClass({...memberClass, memberContact : valid ? "is-valid" : "is-invalid"});
        },[member, memberClass])

    // 주소
        const open = useDaumPostcodePopup("//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");
        const searchAddress = useCallback(()=>{
            open({onComplete : (data)=>{
                let addr = ''; // 주소 변수
                
                if (data.userSelectedType === 'R') { 
                    addr = data.roadAddress;
                } else { 
                    addr = data.jibunAddress;
                }
                setMember(prev=>({
                    ...prev,
                    memberPost : data.zonecode, // 우편번호
                    memberAddress1 : addr,  // 기본주소
                    memberAddress2 : ""
                }))
                // 상세주소 입력창으로 포커스 이동
                memberAddress2Ref.current.focus();
            }});
        },[])

    // 상세주소 입력창을 제어할 ref
    const memberAddress2Ref = useRef();

    // 주소 초기화
    const clearMemberAddress = useCallback(()=>{
        setMember(prev=>({
            ...prev, memberPost : "", memberAddress1 : "", memberAddress2 : ""
        }))
        setMemberClass(prev=>({
            ...prev, memberPost : "", memberAddress1 : "", memberAddress2 : ""
        }))
    },[])

    //주소 초기화 버튼이 표시되어야 하는지 판정
    const hasAnyCharacter = useMemo(()=>{
        if(member.memberPost.length > 0 ) return true;
        if(member.memberAddress1.length > 0 ) return true;
        if(member.memberAddress2.length > 0 ) return true;
        return false;
    },[member])
    //주소 검사
    const checkMemberAddress = useCallback((e)=>{
        const {memberPost, memberAddress1, memberAddress2} = member;
        const fill = memberPost.length > 0 && memberAddress1.length > 0 && memberAddress2.length > 0;
        const empty = memberPost.length === 0 && memberAddress1.length === 0 && memberAddress2.length === 0;
        const valid = fill || empty;
        setMemberClass(prev=>({
            ...prev,
            memberPost : valid ? "is-valid" : "is-invalid",
            memberAddress1 : valid ? "is-valid" : "is-invalid",
            memberAddress2 : valid ? "is-valid" : "is-invalid"
        }));
    }, [member, memberClass]);

    //memo
    // 모든 항목이 유효한지 검사(선택항목은 is-invalid가 아니어야함)
    const memberValid = useMemo(()=>{
        //선택항목
        if(memberClass.memberBirth==="is-invalid") return false;
        if(memberClass.memberContact==="is-invalid") return false;
        if(memberClass.memberPost==="is-invalid") return false;
        if(memberClass.memberAddress1==="is-invalid") return false;
        if(memberClass.memberAddress2==="is-invalid") return false;
        return true;
    },[memberClass])

    //callback
    //최종 수정
    const sendData = useCallback(async()=>{
        if(memberValid === false) return ;
        const {data} = await axios.put(`/member/${loginId}`,member);
        navigate(`/member/mypage/myinfo/${loginId}`); // 메인페이지
    },[member,memberValid])

    //render
    return (<>
        <h2>회원 기본정보 수정</h2>


        {/* 생년월일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">생년월일</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberBirth}`} 
                            name="memberBirth" value={member.memberBirth}
                            onChange={changeStrValue}
                            onBlur={checkMemberBirth}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">잘못된 날짜 형식입니다</div>
            </div>
        </div>

        {/* 연락처 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">연락처</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberContact}`} 
                            name="memberContact" value={member.memberContact}
                            onChange={changeStrValue}
                            onBlur={checkMemberContact}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback">010으로 시작하는 11자리 번호를 입력하세요(- 사용불가)</div>
            </div>
        </div>
        
        {/* 주소 (Post, Address1, Address2) */}
       <div className="row mt-3">
            <label className="col-sm-3 col-form-label">주소</label>
            <div className="col-sm-9 d-flex align-items-center text-nowrap">
                <input type="text" name="memberPost" className={`form-control w-auto ${memberClass.memberPost}`}
                            placeholder="우편번호" value={member.memberPost}
                            onChange={changeStrValue} readOnly
                            onClick={searchAddress}
                            />
                <button type="button" className="btn btn-secondary ms-2"
                            onClick={searchAddress}
                            >
                    <FaMagnifyingGlass/>
                </button>
                {/* 지우기 버튼은 한글자라도 있으면 나와야 한다 */}
                {hasAnyCharacter === true && (
                    <button type="button" className="btn btn-danger ms-2" 
                        onClick={clearMemberAddress}
                        >
                        <FaEraser/>
                    </button>
                    )}
                <div className="valid-feedback" ></div>
                <div className="invalid-feedback" ></div>
            </div>

            <div className="col-sm-9 offset-sm-3 mt-2">
                <input type="text" name="memberAddress1" className={`form-control ${memberClass.memberAddress1}`}
                    placeholder="기본주소" value={member.memberAddress1}
                    onChange={changeStrValue} readOnly
                    onClick={searchAddress}
                    />
                <div className="valid-feedback" ></div>
                <div className="invalid-feedback" ></div>
            </div>
            <div className="col-sm-9 offset-sm-3 mt-2">
                <input type="text" name="memberAddress2" className={`form-control ${memberClass.memberAddress2}`}
                    placeholder="상세주소" value={member.memberAddress2}
                    onChange={changeStrValue}
                    ref={memberAddress2Ref}
                    onBlur={checkMemberAddress}
                     />
                <div className="valid-feedback" ></div>
                <div className="invalid-feedback" >주소는 모두 작성해야 합니다</div>
            </div>
       
       </div>
        
        {/* 가입버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-success w-100"
                            disabled={memberValid === false}
                            onClick = {sendData}
                            >
                <FaUser className="me-2"/>
                <span>수정</span>
                </button>
            </div>
        </div>


    </>)
}