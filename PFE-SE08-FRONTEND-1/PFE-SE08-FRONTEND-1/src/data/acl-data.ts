import { Permission, Role, User } from "@/types/acl.types";

export const permissions: Permission[] = [
  {
    "id": "c62927bb-2790-4878-af3a-c40d34b725e7",
    "creationTimestamp": "2025-05-02T04:29:18.733095",
    "updateTimestamp": "2025-05-02T04:29:18.733118",
    "name": "CREATE_USER",
    "description": "Permission to create users"
  },
  {
    "id": "15856990-f7bd-4e4e-9d17-be7aeeaa7d7b",
    "creationTimestamp": "2025-05-02T04:29:18.7428",
    "updateTimestamp": "2025-05-02T04:29:18.742807",
    "name": "READ_USER",
    "description": "Permission to read user information"
  },
  {
    "id": "b4f41cc2-d14d-4847-a1f6-0937400cda0e",
    "creationTimestamp": "2025-05-02T04:29:18.744789",
    "updateTimestamp": "2025-05-02T04:29:18.744796",
    "name": "UPDATE_USER",
    "description": "Permission to update users"
  },
  {
    "id": "afabbd79-282f-4a71-930a-497b3ed5d146",
    "creationTimestamp": "2025-05-02T04:29:18.746436",
    "updateTimestamp": "2025-05-02T04:29:18.746441",
    "name": "DELETE_USER",
    "description": "Permission to delete users"
  },
  {
    "id": "9e2636a3-b67d-481b-8299-b68b5967837a",
    "creationTimestamp": "2025-05-02T04:29:18.748074",
    "updateTimestamp": "2025-05-02T04:29:18.748079",
    "name": "CREATE_ROLE",
    "description": "Permission to create roles"
  },
  {
    "id": "063d8053-4911-45d4-9972-ec5d152410be",
    "creationTimestamp": "2025-05-02T04:29:18.750381",
    "updateTimestamp": "2025-05-02T04:29:18.750387",
    "name": "READ_ROLE",
    "description": "Permission to read role information"
  },
  {
    "id": "ee252f03-eaa0-463c-94a0-2356e333adb8",
    "creationTimestamp": "2025-05-02T04:29:18.752439",
    "updateTimestamp": "2025-05-02T04:29:18.752446",
    "name": "UPDATE_ROLE",
    "description": "Permission to update roles"
  },
  {
    "id": "ce3bfd67-bc56-48ae-9fd3-6461aca05e2d",
    "creationTimestamp": "2025-05-02T04:29:18.754394",
    "updateTimestamp": "2025-05-02T04:29:18.7544",
    "name": "DELETE_ROLE",
    "description": "Permission to delete roles"
  },
  {
    "id": "d2caba4a-7c8a-40c3-b2c6-f29d3272ed3d",
    "creationTimestamp": "2025-05-02T04:29:18.756445",
    "updateTimestamp": "2025-05-02T04:29:18.756452",
    "name": "ASSIGN_PERMISSION",
    "description": "Permission to assign permissions to roles"
  },
  {
    "id": "8ea9e949-314f-418c-b32a-8a95477ffbb2",
    "creationTimestamp": "2025-05-02T04:29:18.7588",
    "updateTimestamp": "2025-05-02T04:29:18.758808",
    "name": "REVOKE_PERMISSION",
    "description": "Permission to revoke permissions from roles"
  },
  {
    "id": "871165ab-ed6f-493e-b3bd-e97449eb6c45",
    "creationTimestamp": "2025-05-02T04:29:18.761324",
    "updateTimestamp": "2025-05-02T04:29:18.761332",
    "name": "VIEW_DASHBOARD",
    "description": "Permission to view dashboard"
  },
  {
    "id": "c2ddb938-a5d0-4d8d-a6fe-df08e9f778ab",
    "creationTimestamp": "2025-05-02T04:29:18.763264",
    "updateTimestamp": "2025-05-02T04:29:18.763269",
    "name": "MANAGE_SETTINGS",
    "description": "Permission to manage application settings"
  },
  {
    "id": "8460bf7e-800f-4eb2-9d40-3f57d0bc3ec1",
    "creationTimestamp": "2025-05-02T04:29:18.768832",
    "updateTimestamp": "2025-05-02T04:29:18.768842",
    "name": "EXPORT_DATA",
    "description": "Permission to export data"
  }
];

export const roles: Role[] = [
  {
    "id": "9862de37-096a-43f0-a95b-2a7397f66a12",
    "creationTimestamp": "2025-05-02T04:29:18.785104",
    "updateTimestamp": "2025-05-02T04:29:18.785113",
    "name": "ADMIN",
    "description": "Administrator role with all permissions",
    "permissions": [
      {
        "id": "063d8053-4911-45d4-9972-ec5d152410be",
        "creationTimestamp": "2025-05-02T04:29:18.750381",
        "updateTimestamp": "2025-05-02T04:29:18.750387",
        "name": "READ_ROLE",
        "description": "Permission to read role information"
      },
      {
        "id": "871165ab-ed6f-493e-b3bd-e97449eb6c45",
        "creationTimestamp": "2025-05-02T04:29:18.761324",
        "updateTimestamp": "2025-05-02T04:29:18.761332",
        "name": "VIEW_DASHBOARD",
        "description": "Permission to view dashboard"
      },
      {
        "id": "8460bf7e-800f-4eb2-9d40-3f57d0bc3ec1",
        "creationTimestamp": "2025-05-02T04:29:18.768832",
        "updateTimestamp": "2025-05-02T04:29:18.768842",
        "name": "EXPORT_DATA",
        "description": "Permission to export data"
      },
      {
        "id": "ee252f03-eaa0-463c-94a0-2356e333adb8",
        "creationTimestamp": "2025-05-02T04:29:18.752439",
        "updateTimestamp": "2025-05-02T04:29:18.752446",
        "name": "UPDATE_ROLE",
        "description": "Permission to update roles"
      },
      {
        "id": "c62927bb-2790-4878-af3a-c40d34b725e7",
        "creationTimestamp": "2025-05-02T04:29:18.733095",
        "updateTimestamp": "2025-05-02T04:29:18.733118",
        "name": "CREATE_USER",
        "description": "Permission to create users"
      },
      {
        "id": "b4f41cc2-d14d-4847-a1f6-0937400cda0e",
        "creationTimestamp": "2025-05-02T04:29:18.744789",
        "updateTimestamp": "2025-05-02T04:29:18.744796",
        "name": "UPDATE_USER",
        "description": "Permission to update users"
      },
      {
        "id": "ce3bfd67-bc56-48ae-9fd3-6461aca05e2d",
        "creationTimestamp": "2025-05-02T04:29:18.754394",
        "updateTimestamp": "2025-05-02T04:29:18.7544",
        "name": "DELETE_ROLE",
        "description": "Permission to delete roles"
      },
      {
        "id": "c2ddb938-a5d0-4d8d-a6fe-df08e9f778ab",
        "creationTimestamp": "2025-05-02T04:29:18.763264",
        "updateTimestamp": "2025-05-02T04:29:18.763269",
        "name": "MANAGE_SETTINGS",
        "description": "Permission to manage application settings"
      },
      {
        "id": "9e2636a3-b67d-481b-8299-b68b5967837a",
        "creationTimestamp": "2025-05-02T04:29:18.748074",
        "updateTimestamp": "2025-05-02T04:29:18.748079",
        "name": "CREATE_ROLE",
        "description": "Permission to create roles"
      },
      {
        "id": "8ea9e949-314f-418c-b32a-8a95477ffbb2",
        "creationTimestamp": "2025-05-02T04:29:18.7588",
        "updateTimestamp": "2025-05-02T04:29:18.758808",
        "name": "REVOKE_PERMISSION",
        "description": "Permission to revoke permissions from roles"
      },
      {
        "id": "15856990-f7bd-4e4e-9d17-be7aeeaa7d7b",
        "creationTimestamp": "2025-05-02T04:29:18.7428",
        "updateTimestamp": "2025-05-02T04:29:18.742807",
        "name": "READ_USER",
        "description": "Permission to read user information"
      },
      {
        "id": "afabbd79-282f-4a71-930a-497b3ed5d146",
        "creationTimestamp": "2025-05-02T04:29:18.746436",
        "updateTimestamp": "2025-05-02T04:29:18.746441",
        "name": "DELETE_USER",
        "description": "Permission to delete users"
      },
      {
        "id": "d2caba4a-7c8a-40c3-b2c6-f29d3272ed3d",
        "creationTimestamp": "2025-05-02T04:29:18.756445",
        "updateTimestamp": "2025-05-02T04:29:18.756452",
        "name": "ASSIGN_PERMISSION",
        "description": "Permission to assign permissions to roles"
      }
    ]
  },
  {
    "id": "5b60efa6-99cc-40af-b744-4b734fe2f587",
    "creationTimestamp": "2025-05-02T04:29:18.796502",
    "updateTimestamp": "2025-05-02T04:29:18.796511",
    "name": "USER",
    "description": "Regular user role with limited permissions",
    "permissions": [
      {
        "id": "871165ab-ed6f-493e-b3bd-e97449eb6c45",
        "creationTimestamp": "2025-05-02T04:29:18.761324",
        "updateTimestamp": "2025-05-02T04:29:18.761332",
        "name": "VIEW_DASHBOARD",
        "description": "Permission to view dashboard"
      },
      {
        "id": "15856990-f7bd-4e4e-9d17-be7aeeaa7d7b",
        "creationTimestamp": "2025-05-02T04:29:18.7428",
        "updateTimestamp": "2025-05-02T04:29:18.742807",
        "name": "READ_USER",
        "description": "Permission to read user information"
      }
    ]
  },
  {
    "id": "55fd3288-3536-4893-a45d-66c3171404fa",
    "creationTimestamp": "2025-05-02T04:29:18.79946",
    "updateTimestamp": "2025-05-02T04:29:18.799468",
    "name": "MANAGER",
    "description": "Manager role with user management permissions",
    "permissions": [
      {
        "id": "871165ab-ed6f-493e-b3bd-e97449eb6c45",
        "creationTimestamp": "2025-05-02T04:29:18.761324",
        "updateTimestamp": "2025-05-02T04:29:18.761332",
        "name": "VIEW_DASHBOARD",
        "description": "Permission to view dashboard"
      },
      {
        "id": "c2ddb938-a5d0-4d8d-a6fe-df08e9f778ab",
        "creationTimestamp": "2025-05-02T04:29:18.763264",
        "updateTimestamp": "2025-05-02T04:29:18.763269",
        "name": "MANAGE_SETTINGS",
        "description": "Permission to manage application settings"
      },
      {
        "id": "8460bf7e-800f-4eb2-9d40-3f57d0bc3ec1",
        "creationTimestamp": "2025-05-02T04:29:18.768832",
        "updateTimestamp": "2025-05-02T04:29:18.768842",
        "name": "EXPORT_DATA",
        "description": "Permission to export data"
      },
      {
        "id": "15856990-f7bd-4e4e-9d17-be7aeeaa7d7b",
        "creationTimestamp": "2025-05-02T04:29:18.7428",
        "updateTimestamp": "2025-05-02T04:29:18.742807",
        "name": "READ_USER",
        "description": "Permission to read user information"
      },
      {
        "id": "c62927bb-2790-4878-af3a-c40d34b725e7",
        "creationTimestamp": "2025-05-02T04:29:18.733095",
        "updateTimestamp": "2025-05-02T04:29:18.733118",
        "name": "CREATE_USER",
        "description": "Permission to create users"
      },
      {
        "id": "b4f41cc2-d14d-4847-a1f6-0937400cda0e",
        "creationTimestamp": "2025-05-02T04:29:18.744789",
        "updateTimestamp": "2025-05-02T04:29:18.744796",
        "name": "UPDATE_USER",
        "description": "Permission to update users"
      }
    ]
  }
];

// Sample users data
export const users: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    roleId: "9862de37-096a-43f0-a95b-2a7397f66a12", // ADMIN role
    isActive: true,
    createdAt: "2025-04-15T10:30:00Z",
    lastLogin: "2025-05-02T06:45:12Z"
  },
  {
    id: "2",
    username: "john.doe",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    roleId: "5b60efa6-99cc-40af-b744-4b734fe2f587", // USER role
    isActive: true,
    createdAt: "2025-04-16T14:22:00Z",
    lastLogin: "2025-05-01T15:30:45Z"
  },
  {
    id: "3",
    username: "jane.smith",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    roleId: "55fd3288-3536-4893-a45d-66c3171404fa", // MANAGER role
    isActive: true,
    createdAt: "2025-04-17T09:15:00Z",
    lastLogin: "2025-05-02T08:10:22Z"
  },
  {
    id: "4",
    username: "bob.johnson",
    email: "bob.johnson@example.com",
    firstName: "Bob",
    lastName: "Johnson",
    roleId: "5b60efa6-99cc-40af-b744-4b734fe2f587", // USER role
    isActive: false,
    createdAt: "2025-04-18T11:45:00Z",
    lastLogin: "2025-04-25T16:20:33Z"
  },
  {
    id: "5",
    username: "sarah.williams",
    email: "sarah.williams@example.com",
    firstName: "Sarah",
    lastName: "Williams",
    roleId: "55fd3288-3536-4893-a45d-66c3171404fa", // MANAGER role
    isActive: true,
    createdAt: "2025-04-19T08:30:00Z",
    lastLogin: "2025-05-01T14:15:50Z"
  }
];
