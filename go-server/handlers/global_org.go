package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GlobalOrg struct {
	ID               string `json:"id,omitempty"`
	Name             string `json:"name,omitempty"`
	HRMSOrgID        string `json:"hrms_org_id,omitempty"`
	PropeakOrgID     string `json:"propeak_org_id,omitempty"`
	SkillzengineOrgID string `json:"skillzengine_org_id,omitempty"`
}

func CreateOrg(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var org GlobalOrg
		if err := c.BodyParser(&org); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
		}
		err := db.QueryRow(c.Context(),
			`INSERT INTO global_org (name, hrms_org_id, propeak_org_id, skillzengine_org_id)
			 VALUES ($1, $2, $3, $4) RETURNING id`,
			org.Name, org.HRMSOrgID, org.PropeakOrgID, org.SkillzengineOrgID,
		).Scan(&org.ID)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(fiber.Map{"success": true, "org": org, "message": "Org added successfully!"})
	}
}

func GetOrgs(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get pagination params
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 10)
		offset := (page - 1) * limit

		// Count total records
		var total int
		countErr := db.QueryRow(c.Context(), `SELECT COUNT(*) FROM global_org`).Scan(&total)
		if countErr != nil {
			return c.Status(500).JSON(fiber.Map{"error": countErr.Error()})
		}

		// Fetch paginated data
		rows, err := db.Query(c.Context(),
			`SELECT id, name, hrms_org_id, propeak_org_id, skillzengine_org_id
			 FROM global_org
			 ORDER BY name
			 LIMIT $1 OFFSET $2`, limit, offset)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		defer rows.Close()

		var orgs []GlobalOrg
		for rows.Next() {
			var org GlobalOrg
			if err := rows.Scan(&org.ID, &org.Name, &org.HRMSOrgID, &org.PropeakOrgID, &org.SkillzengineOrgID); err != nil {
				return c.Status(500).JSON(fiber.Map{"error": err.Error()})
			}
			orgs = append(orgs, org)
		}

		// Return paginated response
		totalPages := (total + limit - 1) / limit
		return c.JSON(fiber.Map{
			"data":  orgs,
			"total": total,
			"pages": totalPages,
			"page":  page,
		})
	}
}


func GetOrgByID(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var org GlobalOrg
		err := db.QueryRow(c.Context(),
			`SELECT id, name, hrms_org_id, propeak_org_id, skillzengine_org_id FROM global_org WHERE id=$1`, id,
		).Scan(&org.ID, &org.Name, &org.HRMSOrgID, &org.PropeakOrgID, &org.SkillzengineOrgID)

		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Org not found"})
		}
				return c.JSON(fiber.Map{"success": true, "org": org, "message": "Org fetched successfully!"})
	}
}

func UpdateOrg(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var org GlobalOrg
		if err := c.BodyParser(&org); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
		}
		_, err := db.Exec(c.Context(),
			`UPDATE global_org SET name=$1, hrms_org_id=$2, propeak_org_id=$3, skillzengine_org_id=$4 WHERE id=$5`,
			org.Name, org.HRMSOrgID, org.PropeakOrgID, org.SkillzengineOrgID, id,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		org.ID = id
		return c.JSON(fiber.Map{"success": true, "org": org, "message": "Org updated successfully!"})
	}
}

func DeleteOrg(db *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		_, err := db.Exec(c.Context(), `DELETE FROM global_org WHERE id=$1`, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(200).JSON(fiber.Map{"success": true, "message": "Org deleted successfully!"})
	}
}
