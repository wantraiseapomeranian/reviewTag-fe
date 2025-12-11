import { useAtom } from "jotai";
import { loginIdState, loginNicknameState } from "../../utils/jotai";



export default function MemberMypage(){
    const [loginid, setLoginId] = useAtom(loginIdState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    
    return(<>
        <h1 className="text-center"> {loginNickname}님의 퀴즈</h1>
        

    </>)
}