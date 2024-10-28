document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('details-table');
    let taskData = [];

    function fetchTaskDetails() {
        fetch('/read-task-excel/1')  // Always fetching task 1 for now
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    taskData = data; // Store the data for XLSX download
                    displayTaskDetails(data);
                } else {
                    console.error('No data available or data is empty');
                    table.innerHTML = '<tr><td colspan="100%">No data available for this task</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                table.innerHTML = `<tr><td colspan="100%">Error loading task data: ${error.message}</td></tr>`;
            });
    }

    function displayTaskDetails(data) {
        const headers = data[0];
        const rows = data.slice(1);

        // Create table headers
        const headerRow = table.querySelector('thead tr');
        headerRow.innerHTML = ''; // Clear existing headers
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        // Create table rows
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows
        rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // Fetch task details when the page loads
    fetchTaskDetails();

    // Add event listener for download XLSX button
    const downloadXlsxButton = document.getElementById('download-csv');
    downloadXlsxButton.textContent = 'Download XLSX';
    downloadXlsxButton.addEventListener('click', function() {
        if (taskData.length > 0) {
            downloadXLSX(taskData);
        } else {
            console.error('No data available for XLSX download');
            alert('No data available for XLSX download');
        }
    });

    function downloadXLSX(data) {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert the data to a worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Task Data");
        
        // Generate XLSX file and trigger download
        XLSX.writeFile(wb, "task_data.xlsx");
    }
});
