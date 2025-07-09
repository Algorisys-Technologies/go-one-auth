import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
  useNavigate,
} from "react-router";
import {
  useLoaderData,
  Form,
  useNavigation,
  useActionData,
} from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { toast } from "sonner";
import { useEffect } from "react";
import { z } from "zod";
import { API_URL } from "~/config/config";
import { apiRequest } from "~/common/service-request";

// Validation schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  hrms_user_id: z.string().optional(),
  propeak_user_id: z.string().optional(),
  skillzengine_user_id: z.string().optional(),
});

type GlobalUser = z.infer<typeof userSchema> & { id: string };

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  if (id === "add") return { user: null };

  const res = await apiRequest(`${API_URL}/users/${id}`, "GET");
  return { user: res.user };
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const parse = userSchema.safeParse(rawData);
  if (!parse.success) {
    return { errors: parse.error.flatten().fieldErrors };
  }

  const isEdit = params.id !== "add";
  const url = isEdit ? `${API_URL}/users/${params.id}` : `${API_URL}/users`;

  const res = await apiRequest(url, isEdit ? "PUT" : "POST", parse.data);

  return res
};

const GlobalUserForm = () => {
  const { user } = useLoaderData() as { user: GlobalUser | null };
  const nav = useNavigation();
  const isSubmitting = nav.state !== "idle";
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
    if (actionData?.success) {
      toast.success(actionData.message);
      navigate("/globalusers");
    }
  }, [actionData]);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {user ? "Edit User" : "Add User"}
          </h2>

          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input name="name" defaultValue={user?.name || ""} />
              {actionData?.errors?.name && (
                <p className="text-sm text-red-500">
                  {actionData.errors.name[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input name="email" defaultValue={user?.email || ""} />
              {actionData?.errors?.email && (
                <p className="text-sm text-red-500">
                  {actionData.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="hrms_user_id">HRMS User ID</Label>
              <Input
                name="hrms_user_id"
                defaultValue={user?.hrms_user_id || ""}
              />
            </div>

            <div>
              <Label htmlFor="propeak_user_id">Propeak User ID</Label>
              <Input
                name="propeak_user_id"
                defaultValue={user?.propeak_user_id || ""}
              />
            </div>

            <div>
              <Label htmlFor="skillzengine_user_id">SkillzEngine User ID</Label>
              <Input
                name="skillzengine_user_id"
                defaultValue={user?.skillzengine_user_id || ""}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? user
                    ? "Updating..."
                    : "Creating..."
                  : user
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalUserForm;
