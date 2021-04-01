
const Validator = require("validator");
const isEmpty = require('./is.empty');

module.exports = function validateLoginInput(data) {
    console.log(data);
    let errors = {};
    
    
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    console.log(data.email);

   
    if(!Validator.isEmail(data.email)){
        console.log("itu");
        errors.email = "Email is invalid";
    }
   
    console.log(data.email);
    if(Validator.isEmpty(data.email)){
        console.log("ini");
        errors.email = "Email field is required";
    }

   

    if(Validator.isEmpty(data.password)){
        errors.password = "Password field is required";
    }


    return {
        errors,
        isValid : isEmpty(errors)
    }
}