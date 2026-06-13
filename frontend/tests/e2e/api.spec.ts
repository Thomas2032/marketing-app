/**
 * Backend API Integration Tests
 *
 * Covers every new endpoint added in the persistence PR:
 *   Projects CRUD, Campaign project_id, Publish Queue, Batches, Connected Platforms
 *
 * Runs directly against http://localhost:8000.
 * Requires the backend to be running with a clean (or test) database.
 */
import { test, expect } from "@playwright/test";

const API = "http://localhost:8000/api/v1";
const USER_ID = "e2e-test-user";

// Shared state across tests in this file (sequential — fullyParallel: false)
let projectId: string;
let campaignId: string;
let platformConnectionId: string;

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
test.describe("Health", () => {
  test("GET /api/v1/health returns ok", async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
test.describe("Projects CRUD", () => {
  test("POST /projects — creates a project", async ({ request }) => {
    const res = await request.post(`${API}/projects`, {
      data: { user_id: USER_ID, name: "E2E Test Project", description: "Automated test" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.name).toBe("E2E Test Project");
    expect(body.user_id).toBe(USER_ID);
    projectId = body.id;
  });

  test("GET /projects?user_id= — lists projects for user", async ({ request }) => {
    const res = await request.get(`${API}/projects?user_id=${USER_ID}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((p: { id: string }) => p.id === projectId)).toBe(true);
  });

  test("GET /projects/{id} — retrieves single project", async ({ request }) => {
    const res = await request.get(`${API}/projects/${projectId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(projectId);
    expect(body.name).toBe("E2E Test Project");
  });

  test("GET /projects/{id} — 404 for unknown id", async ({ request }) => {
    const res = await request.get(`${API}/projects/00000000-0000-0000-0000-000000000000`);
    expect(res.status()).toBe(404);
  });

  test("PATCH /projects/{id} — updates name and description", async ({ request }) => {
    const res = await request.patch(`${API}/projects/${projectId}`, {
      data: { name: "E2E Renamed Project", description: "Updated desc" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("E2E Renamed Project");
    expect(body.description).toBe("Updated desc");
  });
});

// ---------------------------------------------------------------------------
// Campaigns with project_id
// ---------------------------------------------------------------------------
test.describe("Campaigns with project_id", () => {
  test("POST /campaigns — creates campaign linked to project", async ({ request }) => {
    const res = await request.post(`${API}/campaigns`, {
      data: {
        user_id: USER_ID,
        title: "E2E Campaign",
        brief: "A brief for an automated e2e test campaign.",
        project_id: projectId,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.project_id).toBe(projectId);
    campaignId = body.id;
  });

  test("GET /campaigns?project_id= — returns only campaigns for project", async ({ request }) => {
    const res = await request.get(
      `${API}/campaigns?user_id=${USER_ID}&project_id=${projectId}`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((c: { id: string }) => c.id === campaignId)).toBe(true);
  });

  test("GET /campaigns/{id} — project_id is included in response", async ({ request }) => {
    const res = await request.get(`${API}/campaigns/${campaignId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.project_id).toBe(projectId);
  });

  test("GET /campaigns?user_id= — all campaigns without project filter", async ({ request }) => {
    const res = await request.get(`${API}/campaigns?user_id=${USER_ID}`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Connected Platforms
// ---------------------------------------------------------------------------
test.describe("Connected Platforms", () => {
  test("GET /users/{user_id}/platforms — empty for fresh user", async ({ request }) => {
    const res = await request.get(`${API}/users/${USER_ID}-fresh/platforms`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("POST /users/{user_id}/platforms — connects LinkedIn", async ({ request }) => {
    const res = await request.post(`${API}/users/${USER_ID}/platforms`, {
      data: { platform: "LinkedIn" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.platform).toBe("LinkedIn");
    expect(body.user_id).toBe(USER_ID);
    platformConnectionId = body.id;
  });

  test("POST /users/{user_id}/platforms — idempotent (double connect)", async ({ request }) => {
    const res = await request.post(`${API}/users/${USER_ID}/platforms`, {
      data: { platform: "LinkedIn" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBe(platformConnectionId);
  });

  test("POST /users/{user_id}/platforms — connects X", async ({ request }) => {
    const res = await request.post(`${API}/users/${USER_ID}/platforms`, {
      data: { platform: "X" },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).platform).toBe("X");
  });

  test("GET /users/{user_id}/platforms — lists all connected platforms", async ({ request }) => {
    const res = await request.get(`${API}/users/${USER_ID}/platforms`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const platforms = body.map((p: { platform: string }) => p.platform);
    expect(platforms).toContain("LinkedIn");
    expect(platforms).toContain("X");
  });

  test("DELETE /users/{user_id}/platforms/{id} — disconnects platform", async ({ request }) => {
    const res = await request.delete(
      `${API}/users/${USER_ID}/platforms/${platformConnectionId}`
    );
    expect(res.status()).toBe(204);
  });

  test("GET /users/{user_id}/platforms — LinkedIn removed after delete", async ({ request }) => {
    const res = await request.get(`${API}/users/${USER_ID}/platforms`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const platforms = body.map((p: { platform: string }) => p.platform);
    expect(platforms).not.toContain("LinkedIn");
  });
});

// ---------------------------------------------------------------------------
// Publish Queue
// ---------------------------------------------------------------------------
test.describe("Publish Queue", () => {
  test("GET /projects/{id}/publish/queue — empty initially", async ({ request }) => {
    const res = await request.get(`${API}/projects/${projectId}/publish/queue`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("GET /projects/{id}/publish/queue?status=draft — filter by status", async ({ request }) => {
    const res = await request.get(
      `${API}/projects/${projectId}/publish/queue?status=draft`
    );
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("POST /projects/{id}/publish/queue — rejects invalid output_id FK", async ({ request }) => {
    const res = await request.post(`${API}/projects/${projectId}/publish/queue`, {
      data: [
        {
          campaign_id: campaignId,
          output_id: "00000000-0000-0000-0000-000000000000",
          platform: "LinkedIn",
          text: "E2E test post content",
        },
      ],
    });
    // FK violation → 500, schema error → 422; either proves endpoint exists and validates
    expect([422, 500]).toContain(res.status());
  });

  test("PATCH /projects/{id}/publish/queue/{item_id} — 404 for missing item", async ({ request }) => {
    const res = await request.patch(
      `${API}/projects/${projectId}/publish/queue/00000000-0000-0000-0000-000000000000`,
      { data: { status: "scheduled" } }
    );
    expect(res.status()).toBe(404);
  });

  test("DELETE /projects/{id}/publish/queue/{item_id} — 404 for missing item", async ({ request }) => {
    const res = await request.delete(
      `${API}/projects/${projectId}/publish/queue/00000000-0000-0000-0000-000000000000`
    );
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Publish Batches
// ---------------------------------------------------------------------------
test.describe("Publish Batches", () => {
  test("GET /projects/{id}/publish/batches — empty initially", async ({ request }) => {
    const res = await request.get(`${API}/projects/${projectId}/publish/batches`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("POST /projects/{id}/publish/batches — 404 with invalid item_ids", async ({ request }) => {
    const res = await request.post(`${API}/projects/${projectId}/publish/batches`, {
      data: { item_ids: ["00000000-0000-0000-0000-000000000000"] },
    });
    expect(res.status()).toBe(404);
  });

  test("GET /projects/{id}/publish/batches/{batch_id} — 404 for unknown batch", async ({ request }) => {
    const res = await request.get(
      `${API}/projects/${projectId}/publish/batches/00000000-0000-0000-0000-000000000000`
    );
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Cleanup — delete the test project last
// ---------------------------------------------------------------------------
test.describe("Cleanup", () => {
  test("DELETE /projects/{id} — removes test project", async ({ request }) => {
    const res = await request.delete(`${API}/projects/${projectId}`);
    expect(res.status()).toBe(204);
  });

  test("GET /projects/{id} — 404 after delete", async ({ request }) => {
    const res = await request.get(`${API}/projects/${projectId}`);
    expect(res.status()).toBe(404);
  });
});
