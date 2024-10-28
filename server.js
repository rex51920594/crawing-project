const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const { runTask } = require('./server-side-task');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/read-excel', (req, res) => {
    const filePath = path.join(__dirname, 'task_1.xlsx');
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        res.json(data);
    } catch (error) {
        console.error('Error reading Excel file:', error);
        res.status(500).json({ error: 'Failed to read Excel file' });
    }
});

app.get('/read-task-excel/:id', (req, res) => {
    const taskId = req.params.id;
    const fileName = `task_${taskId}.xlsx`;
    const filePath = path.join(__dirname, fileName);

    if (fs.access(filePath)) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
            res.json(data);
        } catch (error) {
            console.error('Error reading Excel file:', error);
            res.status(500).json({ error: 'Error reading Excel file', details: error.message });
        }
    } else {
        console.error(`File not found: ${filePath}`);
        res.status(404).json({ error: 'Task file not found', filePath: filePath });
    }
});

app.get('/check-task-file/:id', (req, res) => {
    const taskId = req.params.id;
    const fileName = `task_${taskId}.xlsx`;
    const filePath = path.join(__dirname, 'tasks', fileName);
    res.json({ exists: fs.access(filePath) });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this new endpoint to your server.js file
app.get('/get-tasks', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'record.xlsx');
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        res.json(data);
    } catch (error) {
        console.error('Error reading Excel file:', error);
        res.status(500).json({ error: 'Failed to read Excel file' });
    }
});

app.get('/copy-task-file/:id', async (req, res) => {
    const taskId = req.params.id;
    const sourceFile = path.join(__dirname, 'task_1.xlsx');
    const destFile = path.join(__dirname, `task_${taskId}.xlsx`);

    try {
        await fs.copyFile(sourceFile, destFile);
        res.json({ message: `File copied successfully to task_${taskId}.xlsx` });
    } catch (error) {
        console.error('Error copying file:', error);
        res.status(500).json({ error: 'Failed to copy file' });
    }
});

app.post('/copy-file-and-update-status', async (req, res) => {
    const { id, status } = req.body;
    const sourceFile = path.join(__dirname, 'task_1.xlsx');
    const destFile = path.join(__dirname, `task_${id}.xlsx`);
    const recordFilePath = path.join(__dirname, 'data', 'record.xlsx');

    try {
        // Copy the file
        await fs.copyFile(sourceFile, destFile);
        console.log(`File copied successfully to task_${id}.xlsx`);

        // Update task status
        if (fs.access(recordFilePath)) {
            const workbook = xlsx.readFile(recordFilePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const tasks = xlsx.utils.sheet_to_json(worksheet);

            const taskIndex = tasks.findIndex(task => task.id === parseInt(id));
            if (taskIndex !== -1) {
                tasks[taskIndex].status = status;

                const updatedWorksheet = xlsx.utils.json_to_sheet(tasks);
                workbook.Sheets[workbook.SheetNames[0]] = updatedWorksheet;
                xlsx.writeFile(workbook, recordFilePath);

                res.json({ 
                    message: 'File copied and task status updated successfully', 
                    task: tasks[taskIndex] 
                });
            } else {
                res.status(404).json({ error: 'Task not found' });
            }
        } else {
            res.status(404).json({ error: 'Record file not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to copy file or update task status' });
    }
});

app.post('/start-task', (req, res) => {
    const { queryText, startTime } = req.body;
    runTask(queryText, startTime)
        .then(task => {
            res.json({ message: 'Task completed successfully', taskId: task.id });
        })
        .catch(error => {
            console.error('Error processing task:', error);
            res.status(500).json({ error: 'Failed to process task' });
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
