import { checkSchema} from 'express-validator';


export const Status = (code: string): string =>  {
    switch (code) {
        case "0":
            return "Username must have alphanumerics minimum 3 and maximum 10 characters"
        case "1":
            return "Password must contain atleast 6 characters"
        case "2":
            return "Action Rejected"
        case "3":
            return "Username Already Exists"
        case "4": 
            return "User Not Found"
        case "5":
            return "Invalid Password"
        case "6":
            return "Account Created"
        case "7":
            return "Logged Out"
        default:
            return "";
    }
}
    export const authChecks = checkSchema({
        "user": {
            errorMessage: 0,
            notEmpty:true,
            escape: true,
            isAlphanumeric: true,
            isLength: {
                options: {
                    max: 10,
                    min: 3
                }
            }
            
        }, "password": {
            errorMessage: 1,
            isLength: {
                options: {
                    min: 6
                }
            },
            notEmpty: true,
            escape: true
        },
        "action": {
            errorMessage: 2,
            exists: true,
            notEmpty: true,
            escape: true
        }
    })
