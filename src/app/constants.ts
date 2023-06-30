export enum StatusCode {
  OK = 200,
  CREATED =201,
  NO_CONTENT= 204,
  BAD_REQUEST = 400,
  NOT_FOUND= 404,
  METHOD_NOT_ALLOWED = 405,
  SERVER_ERROR = 500,
}
export enum ErrorMessage {
  NOT_FOUND = "Page not found",
  SERVER_ERROR = "Sorry, something went wrong",
  USER_NOT_FOUND = "User not found",
  USER_ID_INVALID = " User ID is invalid",
  REQUEST_URL_FORMAT_INVALID = "Request URL format is invalid",
  REQUEST_BODY_FORMAT_INVALID = "Request body format is invalid",
  METHOD_NOT_ALLOWED = "",
}