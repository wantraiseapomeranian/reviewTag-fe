import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";



export default function MemberMymovie(){
    const [loginid, setLoginId] = useAtom(loginIdState);
    return(<>
        <h1 className="text-center"> {loginid}님의 리뷰</h1>
        

    </>)
}