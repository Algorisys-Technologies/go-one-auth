import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
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

const orgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hrms_org_id: z.string().optional(),
  propeak_org_id: z.string().optional(),
  skillzengine_org_id: z.string().optional(),
});

type GlobalOrg = z.infer<typeof orgSchema> & { id: string };

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  if (id === "add") return { org: null };

  const org = await apiRequest(`${API_URL}/orgs/${id}`, "GET");
  return { org };
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const parse = orgSchema.safeParse(rawData);
  if (!parse.success) {
    return { errors: parse.error.flatten().fieldErrors };
  }

  const isEdit = params.id !== "add";
  const url = isEdit
    ? `${API_URL}/orgs/${params.id}`
    : `${API_URL}/orgs`;

  await apiRequest(url, isEdit ? "PUT" : "POST", parse.data);

  return redirect("/globalorgs");
};

const GlobalOrgForm = () => {
  const { org } = useLoaderData() as { org: GlobalOrg | null };
  const nav = useNavigation();
  const isSubmitting = nav.state !== "idle";
  const actionData = useActionData() as { errors?: Record<string, string[]> };

  useEffect(() => {
    if (actionData?.errors) {
      toast.error("Please correct the highlighted fields.");
    } else if (isSubmitting && !actionData) {
      toast.success(org ? "Organization updated" : "Organization created");
    }
  }, [actionData, isSubmitting, org]);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {org ? "Edit Organization" : "Add Organization"}
          </h2>

          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input name="name" defaultValue={org?.name || ""} />
              {actionData?.errors?.name && (
                <p className="text-sm text-red-500">{actionData.errors.name[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hrms_org_id">HRMS Org ID</Label>
              <Input name="hrms_org_id" defaultValue={org?.hrms_org_id || ""} />
            </div>

            <div>
              <Label htmlFor="propeak_org_id">Propeak Org ID</Label>
              <Input name="propeak_org_id" defaultValue={org?.propeak_org_id || ""} />
            </div>

            <div>
              <Label htmlFor="skillzengine_org_id">SkillzEngine Org ID</Label>
              <Input name="skillzengine_org_id" defaultValue={org?.skillzengine_org_id || ""} />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? org
                    ? "Updating..."
                    : "Creating..."
                  : org
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

export default GlobalOrgForm;
