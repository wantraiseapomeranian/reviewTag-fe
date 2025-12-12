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

        console.log(answerList);
        console.log(addList);
    },[loginId]);



    useEffect(()=>{
        loadData();
    },[loadData]);

    
    return(<>
        <h1 className="text-center mt-4"> {loginNickname}님의 퀴즈</h1>
        
        
        <div className="row mt-2">
            <div className="col text-center">
                <label className="fs-4 mb-2">내가 푼 퀴즈</label>
                <table className="table table-responsive table-hover table-striped">
                    <thead className="quiz-table-thead">
                        <tr>
                            <td>문제</td>
                            <td>정답여부</td>
                            <td>정답률</td>
                        </tr>
                    </thead>
                       {answerQuizList.map((answerQuiz)=>(
                        <tbody key={answerQuiz.quizId}>
                            <tr>
                                <td>{answerQuiz.quizQuestion}</td>
                                <td>{answerQuiz.quizLogIsCorrect}</td>
                                <td></td>
                            </tr>
                        </tbody>
                      ))}
             </table>
            </div>
        </div>


        <div className="row mt-2">
            <div className="col text-center">
                <label className="fs-4 mb-2">내가 등록한 퀴즈</label>
                <div className="table-responsive">
                    <table className="table table-responsive table-hover table-striped">
                        <thead>
                            <tr className="text-truncate quiz-table-thead">
                                <td >문제</td>
                                <td>1번</td>
                                <td>2번</td>
                                <td>3번</td>
                                <td>4번</td>
                                <td>정답</td>
                                <td>정답률</td>
                                <td>풀이횟수</td>
                            </tr>
                        </thead>
                        {addQuizList.map((addQuiz)=>(
                            <tbody key={addQuiz.quizId}>
                                <tr>
                                    <td className="text-truncate quiz-question">{addQuiz.quizQuestion}</td>
                                    <td className="text-truncate quiz-option">{addQuiz.quizQuestionOption1}</td>
                                    <td className="text-truncate quiz-option">{addQuiz.quizQuestionOption2}</td>
                                    <td className="text-truncate quiz-option">{addQuiz.quizQuestionOption3}</td>
                                    <td className="text-truncate quiz-option">{addQuiz.quizQuestionOption4}</td>
                                    <td className="quiz-answer">{addQuiz.quizAnswer}</td>
                                    <td></td>
                                    <td>{addQuiz.solveCount}</td>
                                </tr>
                            </tbody>
                        ))}
                </table>
                </div>
            </div>
        </div>



    </>)
}