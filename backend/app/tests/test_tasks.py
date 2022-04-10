import pytest


@pytest.fixture
def tasks_url(project_id: int) -> str:
    return f"/api/projects/{project_id}/tasks"


def create_task(client, headers, url, title, **fields):
    return client.post(url, json={"title": title, **fields}, headers=headers)


def test_create_task_defaults_to_todo(client, auth_headers, tasks_url, project_id):
    response = create_task(client, auth_headers, tasks_url, "  Draft copy  ")

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Draft copy"
    assert body["status"] == "TODO"
    assert body["project_id"] == project_id


def test_create_task_validates_input(client, auth_headers, tasks_url):
    blank = create_task(client, auth_headers, tasks_url, "   ")
    unknown_status = create_task(client, auth_headers, tasks_url, "x", status="BLOCKED")

    assert blank.status_code == 422
    assert unknown_status.status_code == 422


def test_list_tasks_newest_first(client, auth_headers, tasks_url):
    create_task(client, auth_headers, tasks_url, "First")
    create_task(client, auth_headers, tasks_url, "Second")

    response = client.get(tasks_url, headers=auth_headers)

    assert response.status_code == 200
    assert [task["title"] for task in response.json()] == ["Second", "First"]


def test_filter_tasks_by_status(client, auth_headers, tasks_url):
    create_task(client, auth_headers, tasks_url, "Done work", status="DONE")
    create_task(client, auth_headers, tasks_url, "Pending work")

    response = client.get(tasks_url, params={"status": "DONE"}, headers=auth_headers)

    assert [task["title"] for task in response.json()] == ["Done work"]


def test_search_matches_title_and_description(client, auth_headers, tasks_url):
    create_task(client, auth_headers, tasks_url, "Write homepage copy")
    create_task(client, auth_headers, tasks_url, "Pick images", description="Hero shots")

    by_title = client.get(tasks_url, params={"search": "COPY"}, headers=auth_headers)
    by_description = client.get(
        tasks_url, params={"search": "hero"}, headers=auth_headers
    )
    no_match = client.get(tasks_url, params={"search": "invoice"}, headers=auth_headers)

    assert [task["title"] for task in by_title.json()] == ["Write homepage copy"]
    assert [task["title"] for task in by_description.json()] == ["Pick images"]
    assert no_match.json() == []


def test_search_treats_wildcards_literally(client, auth_headers, tasks_url):
    create_task(client, auth_headers, tasks_url, "Add 50% discount banner")
    create_task(client, auth_headers, tasks_url, "Unrelated task")

    response = client.get(tasks_url, params={"search": "50%"}, headers=auth_headers)

    assert [task["title"] for task in response.json()] == ["Add 50% discount banner"]


def test_filters_combine(client, auth_headers, tasks_url):
    create_task(client, auth_headers, tasks_url, "Copy review", status="DONE")
    create_task(client, auth_headers, tasks_url, "Copy draft")

    response = client.get(
        tasks_url, params={"status": "TODO", "search": "copy"}, headers=auth_headers
    )

    assert [task["title"] for task in response.json()] == ["Copy draft"]


def test_update_task_changes_status(client, auth_headers, tasks_url):
    task = create_task(client, auth_headers, tasks_url, "Draft copy").json()

    response = client.put(
        f"/api/tasks/{task['id']}",
        json={"title": "Draft copy", "description": None, "status": "IN_PROGRESS"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "IN_PROGRESS"


def test_delete_task(client, auth_headers, tasks_url):
    task = create_task(client, auth_headers, tasks_url, "Temporary").json()

    assert (
        client.delete(f"/api/tasks/{task['id']}", headers=auth_headers).status_code == 204
    )
    assert client.get(tasks_url, headers=auth_headers).json() == []


def test_task_endpoints_require_authentication(client, auth_headers, tasks_url):
    task = create_task(client, auth_headers, tasks_url, "Draft copy").json()

    assert client.get(tasks_url).status_code == 401
    assert client.post(tasks_url, json={"title": "x"}).status_code == 401
    assert client.put(f"/api/tasks/{task['id']}", json={"title": "x"}).status_code == 401
    assert client.delete(f"/api/tasks/{task['id']}").status_code == 401


def test_tasks_are_scoped_to_the_project_owner(
    client, auth_headers, other_auth_headers, tasks_url
):
    task = create_task(client, auth_headers, tasks_url, "Draft copy").json()

    assert client.get(tasks_url, headers=other_auth_headers).status_code == 404
    assert (
        client.post(
            tasks_url, json={"title": "x"}, headers=other_auth_headers
        ).status_code
        == 404
    )
    assert (
        client.put(
            f"/api/tasks/{task['id']}",
            json={"title": "Hijacked", "status": "DONE"},
            headers=other_auth_headers,
        ).status_code
        == 404
    )
    assert (
        client.delete(f"/api/tasks/{task['id']}", headers=other_auth_headers).status_code
        == 404
    )


def test_deleting_a_project_deletes_its_tasks(
    client, auth_headers, tasks_url, project_id
):
    task = create_task(client, auth_headers, tasks_url, "Draft copy").json()

    client.delete(f"/api/projects/{project_id}", headers=auth_headers)

    assert (
        client.delete(f"/api/tasks/{task['id']}", headers=auth_headers).status_code == 404
    )


def test_missing_task_returns_404(client, auth_headers):
    assert client.delete("/api/tasks/4242", headers=auth_headers).status_code == 404
