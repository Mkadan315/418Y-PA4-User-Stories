// Here axios throws an error whenever the server answers with a failure status (400, 404, 409, 500, etc)
// If the server sent a message, we show that message
// If there is no response at all, the server can't be reached.
export function getErrorMessage(error) {
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    return 'Could not reach the server';
}