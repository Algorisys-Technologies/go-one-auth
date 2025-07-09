package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"go-server/db"
	"go-server/handlers"
)

func main() {
	dbpool, err := db.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer dbpool.Close()

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Go Fiber + pgx running")
	})

	// Global Org CRUD
	app.Post("/api/orgs", handlers.CreateOrg(dbpool))
	app.Get("/api/orgs", handlers.GetOrgs(dbpool))
	app.Get("/api/orgs/:id", handlers.GetOrgByID(dbpool))
	app.Put("/api/orgs/:id", handlers.UpdateOrg(dbpool))
	app.Delete("/api/orgs/:id", handlers.DeleteOrg(dbpool))

	// Global User CRUD
	app.Post("/api/users", handlers.CreateUser(dbpool))
	app.Get("/api/users", handlers.GetUsers(dbpool))
	app.Get("/api/users/:id", handlers.GetUserByID(dbpool))
	app.Put("/api/users/:id", handlers.UpdateUser(dbpool))
	app.Delete("/api/users/:id", handlers.DeleteUser(dbpool))

	log.Fatal(app.Listen(":3000"))
}
