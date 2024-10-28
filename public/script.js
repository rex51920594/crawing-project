document.addEventListener('DOMContentLoaded', function() {
    const runButton = document.getElementById('run');
    const searchQuery = document.getElementById('search-query');
    const resetLink = document.getElementById('reset');

    runButton.addEventListener('click', function() {
        const queryText = searchQuery.value;
        const startTime = new Date().toISOString();

        document.body.innerHTML = `
            <div class="progress-page">
                <a href="output.html" class="view-all-tasks">View All Tasks</a>
                <div class="progress-content">
                    <h2>In Progress</h2>
                    <div class="loader"></div>
                </div>
            </div>
        `;

        // Start the task on the server
        fetch('/start-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                queryText: queryText,
                startTime: startTime
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task completed:', data);
            // Redirect to the task details page
            window.location.href = `task-details.html?id=${data.taskId}`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing the task. Please check the console for details.');
        });
    });

    // Add event listener for the Reset to Default link
    resetLink.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent the default link behavior
        searchQuery.value = ''; // Clear the search query input field
    });
});
