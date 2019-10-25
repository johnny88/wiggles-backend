package db

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"

	"github.com/johnny88/wiggles-backend/env"
)

type (
	// DB represents the methods connection to the firestore database
	DB interface {
		Connect() error
		Close()
	}

	// Conn is the connection struct that implements the DB interface
	Conn struct {
		Client *firestore.Client
		Ctx context.Context
	}
)

// Connect creates the connection to the firebase db based on the
// ProjectID field
func (conn *Conn)Connect() error {
	c := env.Config{}
	err := c.Populate()
	if err != nil {
		return err
	}

	conn.Ctx = context.Background()
	fire := &firebase.Config{ProjectID: c.ProjectID}
	app, err := firebase.NewApp(conn.Ctx, fire)
	if err != nil {
		return err
	}

	conn.Client, err = app.Firestore(conn.Ctx)

	if err != nil {
		return err
	}
	return nil
}

// Close is a wrapper for the firebase close function
// used mostly for mocking purposes
func (conn *Conn)Close() {
	conn.Client.Close()
}