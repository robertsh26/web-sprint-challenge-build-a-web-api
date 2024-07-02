// Write your "actions" router here!
const express = require('express');
const Projects = require('../projects/projects-model');
const Actions = require('./actions-model'); 
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const actions = await Actions.get();
        res.json(actions || []);
    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve actions",
            err: err.message,
            stack: err.stack
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const action = await Actions.get(id);
        if (action) {
            res.json(action);
        } else {
            res.status(404).json({ message: 'Action not found' });
        }
    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve the action",
            err: err.message,
            stack: err.stack
        });
    }
});

router.post('/', async (req, res) => {
    const { project_id, description, notes } = req.body;

    // Check for required fields
    if (!project_id || !description || !notes) {
        return res.status(400).json({ message: "Missing required fields: project_id, description, and notes" });
    }

    try {
        // Verify project exists
        const projectExists = await Projects.get(project_id);
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Insert new action
        const newAction = await Actions.insert({ project_id, description, notes });
        if (newAction) {
            const fetchedAction = await Actions.get(newAction.id); // Make sure to retrieve the new action
            res.status(201).json(fetchedAction);
        } else {
            res.status(400).json({ message: "Failed to create new action" });
        }
    } catch (err) {
        res.status(500).json({
            message: "Failed to create new action",
            err: err.message,
            stack: err.stack
        });
    }
});


router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { project_id, description, notes, completed } = req.body;

    // Check for all required fields
    if (!project_id || !description || !notes || completed === undefined) {
        return res.status(400).json({
            message: "Missing required fields: project_id, description, notes, and completed status"
        });
    }

    try {
        // Verify the action exists before updating
        const actionExists = await Actions.get(id);
        if (!actionExists) {
            return res.status(404).json({ message: 'Action not found' });
        }

        // Perform the update
        const updatedAction = await Actions.update(id, { project_id, description, notes, completed });
        if (updatedAction) {
            res.status(200).json(updatedAction);
        } else {
            res.status(404).json({ message: 'Action not found' }); // In case the update fails
        }
    } catch (err) {
        res.status(500).json({
            message: "Failed to update action",
            err: err.message,
            stack: err.stack
        });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const actionExists = await Actions.get(id);
        if (!actionExists) {
            return res.status(404).json({ message: "Action not found" });
        }
        await Actions.remove(id);
        res.status(204).end(); // No content to return, but successful operation
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete action",
            err: err.message,
            stack: err.stack
        });
    }
});

module.exports = router
