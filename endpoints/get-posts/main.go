package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"google.golang.org/api/iterator"

	"github.com/johnny88/wiggles-backend/db"
	"github.com/johnny88/wiggles-backend/models"
)

type key int

const dbKey key = 0

func main() {
	log.Println("Get posts started.")

	r := chi.NewRouter()
	r.Use(dbContext)
	r.Get("/", handler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), r))
}

func dbContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := db.Conn{}
		err := c.Connect()
		if err != nil {
			addErrorToResponse(&w, http.StatusInternalServerError)
			return
		}
		ctx := context.WithValue(r.Context(), dbKey, &c)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func handler(w http.ResponseWriter, r *http.Request) {
	log.Println("Get posts recieved a request.")
	ctx := r.Context()
	fmt.Println(ctx)
	conn := ctx.Value(dbKey).(*db.Conn)
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
