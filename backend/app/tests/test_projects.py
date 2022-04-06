def test_create_project(client, auth_headers):
    response = client.post(
        "/api/projects",
        json={"name": "  Website redesign  ", "description": "  "},
        headers=auth_headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Website redesign"
    assert body["description"] is None


def test_create_project_validates_input(client, auth_headers):
    blank = client.post("/api/projects", json={"name": "   "}, headers=auth_headers)
    too_long = client.post(
        "/api/projects", json={"name": "a" * 121}, headers=auth_headers
    )

    assert blank.status_code == 422
    assert too_long.status_code == 422


def test_list_projects_includes_task_counts(client, auth_headers, project_id):
    client.post(
        f"/api/projects/{project_id}/tasks",
        json={"title": "Draft copy", "status": "DONE"},
        headers=auth_headers,
    )
    client.post(
        f"/api/projects/{project_id}/tasks",
        json={"title": "Pick images"},
        headers=auth_headers,
    )

    response = client.get("/api/projects", headers=auth_headers)

    assert response.status_code == 200
    [project] = response.json()
    assert project["stats"] == {
        "total_tasks": 2,
        "todo": 1,
        "in_progress": 0,
        "done": 1,
        "completion_percentage": 50,
    }


def test_project_stats_endpoint(client, auth_headers, project_id):
    client.post(
        f"/api/projects/{project_id}/tasks",
        json={"title": "Draft copy", "status": "IN_PROGRESS"},
        headers=auth_headers,
    )

    response = client.get(f"/api/projects/{project_id}/stats", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == {
        "total_tasks": 1,
        "todo": 0,
        "in_progress": 1,
        "done": 0,
        "completion_percentage": 0,
    }


def test_stats_for_a_project_without_tasks(client, auth_headers, project_id):
    response = client.get(f"/api/projects/{project_id}/stats", headers=auth_headers)

    assert response.json()["completion_percentage"] == 0


def test_update_project(client, auth_headers, project_id):
    response = client.put(
        f"/api/projects/{project_id}",
        json={"name": "Website relaunch", "description": "Q1"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Website relaunch"
    assert (
        client.get(f"/api/projects/{project_id}", headers=auth_headers).json()[
            "description"
        ]
        == "Q1"
    )


def test_delete_project(client, auth_headers, project_id):
    assert (
        client.delete(f"/api/projects/{project_id}", headers=auth_headers).status_code
        == 204
    )
    assert (
        client.get(f"/api/projects/{project_id}", headers=auth_headers).status_code == 404
    )
    assert client.get("/api/projects", headers=auth_headers).json() == []


def test_project_endpoints_require_authentication(client, project_id):
    assert client.get("/api/projects").status_code == 401
    assert client.post("/api/projects", json={"name": "New"}).status_code == 401
    assert client.get(f"/api/projects/{project_id}").status_code == 401
    assert (
        client.put(f"/api/projects/{project_id}", json={"name": "New"}).status_code == 401
    )
    assert client.delete(f"/api/projects/{project_id}").status_code == 401


def test_users_only_see_their_own_projects(
    client, auth_headers, other_auth_headers, project_id
):
    assert client.get("/api/projects", headers=other_auth_headers).json() == []
    assert (
        client.get(f"/api/projects/{project_id}", headers=other_auth_headers).status_code
        == 404
    )
    assert (
        client.get(
            f"/api/projects/{project_id}/stats", headers=other_auth_headers
        ).status_code
        == 404
    )


def test_users_cannot_change_another_users_project(
    client, other_auth_headers, project_id
):
    update = client.put(
        f"/api/projects/{project_id}",
        json={"name": "Hijacked"},
        headers=other_auth_headers,
    )
    delete = client.delete(f"/api/projects/{project_id}", headers=other_auth_headers)

    assert update.status_code == 404
    assert delete.status_code == 404


def test_missing_project_returns_404(client, auth_headers):
    assert client.get("/api/projects/4242", headers=auth_headers).status_code == 404
