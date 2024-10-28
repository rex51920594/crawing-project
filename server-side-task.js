const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');

async function runTask(queryText, startTime) {
    // Simulate task creation
    const task = await createTask(queryText, startTime);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Update task status and finish time
    const updatedTask = await updateTaskStatus(task.id, 'Completed');

    return updatedTask;
}

async function createTask(queryText, startTime) {
    const dataFolder = path.join(__dirname, 'data');
    const filePath = path.join(dataFolder, 'record.xlsx');

    // Create data folder if it doesn't exist
    try {
        await fs.access(dataFolder);
    } catch {
        await fs.mkdir(dataFolder);
    }

    let workbook;
    let worksheet;
    let tasks = [];

    // Define headers
    const headers = ['id', 'name', 'count', 'status', 'duration', 'startTime', 'finishTime'];

    // Read existing file or create a new one
    try {
        await fs.access(filePath);
        workbook = xlsx.readFile(filePath);
        worksheet = workbook.Sheets[workbook.SheetNames[0]];
        tasks = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (tasks.length > 0 && tasks[0][0] !== 'id') {
            tasks.unshift(headers);
        }
    } catch {
        workbook = xlsx.utils.book_new();
        worksheet = xlsx.utils.aoa_to_sheet([headers]);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Tasks");
        tasks = [headers];
    }

    // Calculate new ID
    const maxId = tasks.length > 1 ? Math.max(...tasks.slice(1).map(task => parseInt(task[0]) || 0)) : 0;
    const newId = maxId + 1;

    // Create new task
    const newTask = [
        newId,
        queryText,
        1,
        'On Progress',
        '0s',
        startTime,
        '' // Leave finish time empty for now
    ];
    tasks.push(newTask);

    // Write updated data back to the file
    const updatedWorksheet = xlsx.utils.aoa_to_sheet(tasks);
    workbook.Sheets[workbook.SheetNames[0]] = updatedWorksheet;
    await fs.writeFile(filePath, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));

    return Object.fromEntries(headers.map((header, index) => [header, newTask[index]]));
}

async function updateTaskStatus(taskId, status) {
    const filePath = path.join(__dirname, 'data', 'record.xlsx');

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const tasks = xlsx.utils.sheet_to_json(worksheet);

    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        
        // Update finish time and calculate duration if status is 'Completed'
        if (status === 'Completed') {
            const finishTime = new Date().toISOString();
            tasks[taskIndex].finishTime = finishTime;
            
            const startTime = new Date(tasks[taskIndex].startTime);
            const duration = (new Date(finishTime) - startTime) / 1000; // Duration in seconds
            tasks[taskIndex].duration = `${duration}s`;
        }

        const updatedWorksheet = xlsx.utils.json_to_sheet(tasks);
        workbook.Sheets[workbook.SheetNames[0]] = updatedWorksheet;
        await fs.writeFile(filePath, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));

        return tasks[taskIndex];
    } else {
        throw new Error('Task not found');
    }
}

module.exports = { runTask };
