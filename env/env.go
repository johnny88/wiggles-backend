package env

import (
	"log"
	"os"
 	
    "github.com/joho/godotenv"
)

// Conf is the config interface
type Conf interface {
	Populate() error
}

// Config is the struct for config information
type Config struct {
	ProjectID string
}

// Populate reads local env file and populates it the config struct
func (c Config) Populate() error {
	err := godotenv.Load()
  	if err != nil {
		log.Println("Error loading .env file")
		return err
	}
	c.ProjectID = os.Getenv("PROJECT_ID")
	return nil
}