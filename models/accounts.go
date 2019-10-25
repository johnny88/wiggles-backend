package models

import (
	"cloud.google.com/go/firestore"
)

// Account is a description of the user
type Account struct {
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	ID          string `json:"id"`
	PhotoURL    string `json:"photoURL"`
}

// AccountFromFirestore returns an account model struct from a Firestore
// iterable
func AccountFromFirestore(i *firestore.DocumentIterator) (Account, error) {
	a := Account{}
	doc, err := i.Next()
	if err != nil {
		return a, err
	}

	err = doc.DataTo(&a)
	if err != nil {
		return a, err
	}
	return a, nil
}
