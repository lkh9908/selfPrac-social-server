module.exports.validateRegisterInput = (
    userName,
    email,
    password,
    confirmPassword
) => {
    const errors = {}
    if (userName.trim() === ''){
        errors.userName = 'Username is empty'
    }
    if (email.trim === ''){
        errors.email() = 'email is empty'
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[0-9a-zA-Z]{2,9})$/
        if (!email.match(regEx)){
            errors.email = 'Email is not in a valid email address'
        }
    }
    if (password.trim() === ''){
        errors.password = 'Password is empty'
    } else if(password !== confirmPassword){
        errors.confirmPassword = 'Confirm password does not match password'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}

module.exports.validateLoginInput = (userName, password) => {
    const errors = {}
    if (userName.trim() === '') {
      errors.userName = 'User name is empty'
    }
    if (password.trim() === '') {
      errors.password = 'Password is empty'
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1
    }
}