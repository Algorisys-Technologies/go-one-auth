import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("globalusers", "routes/globalusers.tsx"),
  route("globalorgs", "routes/globalorgs.tsx"),

  route("globaluser/:id", "routes/globaluser.$id.tsx"),
  route("globalorg/:id", "routes/globalorg.$id.tsx"),
] satisfies RouteConfig;
