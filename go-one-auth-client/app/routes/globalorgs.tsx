import type { ActionFunction, LoaderFunction } from 'react-router';
import { useLoaderData, Form, useActionData } from 'react-router';
import Table from '~/components/table';
import { API_URL } from '~/config/config';
import { apiRequest } from '~/common/service-request';
import { Button } from '~/components/ui/button';
import { Link } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface GlobalOrg {
  id: string;
  name?: string;
  hrms_org_id?: string;
  propeak_org_id?: string;
  skillzengine_org_id?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "0");
  const res = await apiRequest(`${API_URL}/orgs?page=${page + 1}`, "GET");
  return { orgs: res.data|| [], pages: res.pages, currentPage: page };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id");
  if (request.method === "DELETE" && id) {
    let res = await apiRequest(`${API_URL}/orgs/${id}`, "DELETE");
    console.log(res)
    return res
  }
  return null
};

const GlobalOrgsTable = () => {
  const { orgs, pages, currentPage } = useLoaderData() as {
    orgs: GlobalOrg[];
    pages: number;
    currentPage: number;
  };
  const actionData = useActionData()
  const headers = [
    { key: "name", label: "Name", search: true },
    { key: "hrms_org_id", label: "HRMS Org ID" },
    { key: "propeak_org_id", label: "Propeak Org ID" },
    { key: "skillzengine_org_id", label: "SkillzEngine Org ID" },
  ];

  const displayActions = (org: GlobalOrg) => (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link to={`/globalorg/${org.id}`}>Edit</Link>
      </Button>
      <Form method="post">
        <input type="hidden" name="id" value={org.id} />
        <Button
          size="sm"
          variant="destructive"
          type="submit"
          formMethod="delete"
        >
          Delete
        </Button>
      </Form>
    </div>
  );

    useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } 
     if (actionData?.success) {
      toast.success(actionData.message);
    }
  }, [actionData]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Global Organizations</h2>
        <Button asChild>
          <Link to="/globalorg/add">Add Organization</Link>
        </Button>
      </div>
      <Table
        pages={pages}
        currentPage={currentPage}
        customHeaders={headers}
        rows={orgs}
        displayActions={displayActions}
        search
        tableInfo
        totalCount={orgs.length}
      />
    </div>
  );
};

export default GlobalOrgsTable;
