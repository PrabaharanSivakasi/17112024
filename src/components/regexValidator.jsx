const usernameRegex = /^[0-9A-Za-z]{6,16}$/;
const passwordRegex = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[!@#$%*_.]).{8,16}$/;

export const usernameValidator = (username) => {
    return usernameRegex.test(username)
}

export const passwordValidator = (password) => {
    return passwordRegex.test(password)
}