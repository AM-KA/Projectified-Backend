const ERROR_OCCURED = "There was an error";
const NOT_FOUND = "The requested data was not found.";
const AUTH_FAILED = "Authorization failed."
const MAIL_EXISTS = "There is an account already associated with the given email ID.";
const PHONE_EXISTS = "There is an account already associated with the given phone number.";
const CREDENTIALS_OK = "The credentials are OK.";
const OTP_SENT = "OTP was sent to your mail successfully.";
const OTP_SUCCESS = "OTP was verified successfully.";
const BAD_REQUEST = "Bad Request";
const TOO_SOON = "Please wait for at least 5 minutes before requesting for a new OTP.";

module.exports = {
    ERROR_OCCURED: ERROR_OCCURED,
    NOT_FOUND: NOT_FOUND,
    AUTH_FAILED: AUTH_FAILED,
    MAIL_EXISTS:MAIL_EXISTS,
    PHONE_EXISTS:PHONE_EXISTS,
    CREDENTIALS_OK:CREDENTIALS_OK,
    OTP_SUCCESS:OTP_SUCCESS,
    OTP_SENT:OTP_SENT,
    BAD_REQUEST:BAD_REQUEST,
    TOO_SOON:TOO_SOON
};