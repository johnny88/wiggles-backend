package endpoints

import (
	"net/http"
)

func AddErrorToResponse(w *http.ResponseWriter, code int) {
	http.Error(
		*w,
		http.StatusText(http.StatusInternalServerError),
		http.StatusInternalServerError,
	)
}
