import { useAtom } from "jotai";
import { loginIdState, loginNicknameState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";



export default function MemberMypage(){
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginNickname, setLoginNickname] = useAtom(loginNicknameState);
    
    //state
    const [answerQuizList, setAnswerQuizList] = useState([]);
    const [addQuizList, setAddQuizList] = useState([]);

    //callback
    const loadData = useCallback(async()=>{
        const answerList = await axios.get(`/member/myanswerquiz/${loginId}`);
        setAnswerQuizList(answerList.data);

        const addList = await axios.get(`/member/myaddquiz/${loginId}`);
        setAddQuizList(addList.data);

        console.log(addList);
        console.log(answerList);
    },[loginId]);



    useEffect(()=>{
        loadData();
    },[loadData]);

    
    return(<>
        <h1 className="text-center"> {loginNickname}님의 퀴즈</h1>
        
        <div className="row mt-2">
            {answerQuizList.map((answerQuiz)=>(
                <div>
               {answerQuiz.quizQuestion}
               {answerQuiz.quizLogIsCorrect}
               </div>
            ))}
        </div>


        <div className="row mt-2">
            {addQuizList.map((addQuiz)=>(
                <div>
                {addQuiz.quizQuestion}
                {addQuiz.quizType}
                {addQuiz.quizOption1}
                {addQuiz.quizOption2}
                {addQuiz.quizOption3}
                {addQuiz.quizOption4}
                {addQuiz.quizAnswer}
               </div>
            ))}
        </div>



    </>)
}