package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"

	"github.com/johnny88/wiggles-backend/db"
	"github.com/johnny88/wiggles-backend/endpoints"
	"github.com/johnny88/wiggles-backend/env"
)

func main() {
	log.Println("Wiggles backend started.")

	r := chi.NewRouter()
	r.Use(dbMiddleware)
	r.Get("/accounts", endpoints.GetAccountsHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), r))
}

func dbMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := db.Conn{}
		err := c.Connect()
		if err != nil {
			fmt.Println(err)
			addErrorToResponse(&w, http.StatusInternalServerError)
			return
		}
		ctx := context.WithValue(r.Context(), env.DbKey, &c)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func addErrorToResponse(w *http.ResponseWriter, code int) {
	http.Error(
		*w,
		http.StatusText(http.StatusInternalServerError),
		http.StatusInternalServerError,
	)
}
