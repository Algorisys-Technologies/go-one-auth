import type { ActionFunction, LoaderFunction } from 'react-router';
import { useLoaderData, Form } from 'react-router';
import Table from '~/components/table';
import { API_URL } from '~/config/config';
import { apiRequest } from '~/common/service-request';
import { Button } from '~/components/ui/button';
import { Link } from 'react-router';

interface GlobalUser {
  id: string;
  name?: string;
  email?: string;
  hrms_user_id?: string;
  propeak_user_id?: string;
  skillzengine_user_id?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "0");
  const res = await apiRequest(`${API_URL}/users?page=${page + 1}`, "GET");
  return { users: res.data, pages: res.pages, currentPage: page };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id");
  if (request.method === "DELETE" && id) {
    await apiRequest(`${API_URL}/users/${id}`, "DELETE");
  }
  return null;
};

const GlobalUsersTable = () => {
  const { users, pages, currentPage } = useLoaderData() as {
    users: GlobalUser[];
    pages: number;
    currentPage: number;
  };

  const headers = [
    { key: "name", label: "Name", search: true },
    { key: "email", label: "Email" },
    { key: "hrms_user_id", label: "HRMS User ID" },
    { key: "propeak_user_id", label: "Propeak User ID" },
    { key: "skillzengine_user_id", label: "SkillzEngine User ID" },
  ];

  const displayActions = (user: GlobalUser) => (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" asChild>
        <Link to={`/globaluser/${user.id}`}>Edit</Link>
      </Button>
      <Form method="post">
        <input type="hidden" name="id" value={user.id} />
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Global Users</h2>
        <Button asChild>
          <Link to="/globaluser/add">Add User</Link>
        </Button>
      </div>
      <Table
        pages={pages}
        currentPage={currentPage}
        customHeaders={headers}
        rows={users}
        displayActions={displayActions}
        search
        tableInfo
        totalCount={users.length}
      />
    </div>
  );
};

export default GlobalUsersTable;
