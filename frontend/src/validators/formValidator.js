import { useState } from "react"

const validate = ({nickname, email, password, passwordAgain}) => {

    const [errors, setErrors] = useState();

    if (nickname.length < 3) setErrors('Имя должно иметь минимум 3 символа');
    if (nickname.length > 10) setErrors('Слишком длинное имя!');
    if (nickname.length < 5) setErrors('Слишком короткое имя!');
    if (nickname.length < 5) setErrors('Слишком короткое имя!');

}