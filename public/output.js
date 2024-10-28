document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#task-table tbody');

    function populateTable(tasks) {
        tableBody.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="task-details.html?id=${task.id}">View Task ${task.id}</a></td>
                <td>${task.name}</td>
                <td>${task.count}</td>
                <td><span class="status-completed">${task.status}</span></td>
                <td>${task.duration}</td>
                <td>${task.startTime}</td>
                <td>${task.finishTime}</td>
                <td>
                    <span class="action-delete">✕</span>
                    <span class="action-edit">✎</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function fetchTasks() {
        fetch('/get-tasks')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                populateTable(data);
            })
            .catch(error => {
                console.error('Error:', error);
                tableBody.innerHTML = `<tr><td colspan="8">Error loading tasks: ${error.message}</td></tr>`;
            });
    }

    fetchTasks();

    // Add pagination functionality here if needed
});
