export interface EndpointPermissions {
  delegatedWork?: string[];
  application?: string[];
}

interface PermissionsIndex {
  count: number;
  permissions: Record<string, EndpointPermissions>;
}

let cache: PermissionsIndex | null = null;
let loading: Promise<PermissionsIndex> | null = null;

export async function loadPermissions(): Promise<PermissionsIndex> {
  if (cache) return cache;
  if (loading) return loading;
  loading = fetch("/data/permissions.json")
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Failed to load permissions index: ${r.status} ${r.statusText}`);
      }
      return r.json();
    })
    .then((data: PermissionsIndex) => {
      cache = data;
      return data;
    })
    .catch((err) => {
      loading = null;
      throw err;
    });
  return loading;
}

export function lookupPermissions(
  index: PermissionsIndex,
  method: string,
  path: string,
): EndpointPermissions | null {
  const key = `${method} ${path}`;
  if (index.permissions[key]) return index.permissions[key];

  // Replace GUIDs and numeric IDs with {id}
  const generalizedPath = path
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "/{id}",
    )
    .replace(/\/\d+/g, "/{id}");
  const generalKey = `${method} ${generalizedPath}`;
  if (index.permissions[generalKey]) return index.permissions[generalKey];

  // Strip version prefix and retry
  const stripped = path.replace(/^\/(v1\.0|beta)\//, "/");
  const strippedKey = `${method} ${stripped}`;
  if (index.permissions[strippedKey]) return index.permissions[strippedKey];

  return null;
}
