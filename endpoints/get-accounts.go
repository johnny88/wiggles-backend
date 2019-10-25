package endpoints

import (
	"encoding/json"
	"log"
	"net/http"

	"google.golang.org/api/iterator"

	"github.com/johnny88/wiggles-backend/db"
	"github.com/johnny88/wiggles-backend/env"
	"github.com/johnny88/wiggles-backend/models"
)

func GetAccountsHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Get accounts recieved a request.")
	ctx := r.Context()
	conn := ctx.Value(env.DbKey).(*db.Conn)
	defer conn.Close()

	var accounts []models.Account
	iter := conn.Client.Collection("accounts").Documents(ctx)
	defer iter.Stop()
	for {
		a, err := models.AccountFromFirestore(iter)
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("Failed to iterate: %+v", err)
		}
		accounts = append(accounts, a)
	}
	resJSON, err := json.Marshal(accounts)
	if err != nil {
		addErrorToResponse(&w, http.StatusInternalServerError)
		return
	}
	w.Write(resJSON)
}

func addErrorToResponse(w *http.ResponseWriter, code int) {
	http.Error(
		*w,
		http.StatusText(http.StatusInternalServerError),
		http.StatusInternalServerError,
	)
}
