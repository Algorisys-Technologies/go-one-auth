package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GlobalUser struct {
	ID               string `json:"id,omitempty"`
	Name             string `json:"name,omitempty"`
	Email            string `json:"email,omitempty"`
	HRMSUserID       string `json:"hrms_user_id,omitempty"`
	PropeakUserID    string `json:"propeak_user_id,omitempty"`
	SkillzengineUserID string `json:"skillzengine_user_id,omitempty"`
}

func CreateUser(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var user GlobalUser
		if err := c.BodyParser(&user); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
		}

		err := db.QueryRow(c.Context(),
			`INSERT INTO global_user (name, email, hrms_user_id, propeak_user_id, skillzengine_user_id)
			 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
			user.Name, user.Email, user.HRMSUserID, user.PropeakUserID, user.SkillzengineUserID,
		).Scan(&user.ID)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(201).JSON(user)
	}
}

func GetUsers(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get query params
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 10)
		offset := (page - 1) * limit

		// Get total count
		var total int
		err := db.QueryRow(c.Context(), `SELECT COUNT(*) FROM global_user`).Scan(&total)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		// Get paginated users
		rows, err := db.Query(c.Context(),
			`SELECT id, name, email, hrms_user_id, propeak_user_id, skillzengine_user_id
			 FROM global_user
			 ORDER BY name
			 LIMIT $1 OFFSET $2`, limit, offset)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		defer rows.Close()

		var users []GlobalUser
		for rows.Next() {
			var user GlobalUser
			if err := rows.Scan(
				&user.ID,
				&user.Name,
				&user.Email,
				&user.HRMSUserID,
				&user.PropeakUserID,
				&user.SkillzengineUserID,
			); err != nil {
				return c.Status(500).JSON(fiber.Map{"error": err.Error()})
			}
			users = append(users, user)
		}

		totalPages := (total + limit - 1) / limit

		return c.JSON(fiber.Map{
			"data":  users,
			"total": total,
			"pages": totalPages,
			"page":  page,
		})
	}
}


func GetUserByID(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var user GlobalUser
		err := db.QueryRow(c.Context(),
			`SELECT id, name, email, hrms_user_id, propeak_user_id, skillzengine_user_id FROM global_user WHERE id=$1`,
			id,
		).Scan(&user.ID, &user.Name, &user.Email, &user.HRMSUserID, &user.PropeakUserID, &user.SkillzengineUserID)

		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}

		return c.JSON(user)
	}
}

func UpdateUser(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var user GlobalUser
		if err := c.BodyParser(&user); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
		}

		_, err := db.Exec(c.Context(),
			`UPDATE global_user SET name=$1, email=$2, hrms_user_id=$3, propeak_user_id=$4, skillzengine_user_id=$5 WHERE id=$6`,
			user.Name, user.Email, user.HRMSUserID, user.PropeakUserID, user.SkillzengineUserID, id,
		)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		user.ID = id
		return c.JSON(user)
	}
}

func DeleteUser(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		_, err := db.Exec(c.Context(), `DELETE FROM global_user WHERE id=$1`, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.SendStatus(204)
	}
}
