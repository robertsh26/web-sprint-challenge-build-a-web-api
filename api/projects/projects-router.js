// Write your "projects" router here!
const express = require('express');
const Projects = require('./projects-model');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const projects = await Projects.get();
        res.json(projects || []);
    } catch (err) {
        res.status(500).json({
            message: "The projects information could not be retrieved",
            err: err.message,
            stack: err.stack,
        })
    }
});

router.get('/:id', async (req, res) => {
    try {
        const project = await Projects.get(req.params.id);
        if (!project) {
            res.status(404).json({
                message: "The project with the specified ID does not exist",
            })
        } else {
            res.json(project)
        }
    } catch (err) {
        res.status(500).json({
            message: "The project information could not be retrieved",
            err: err.message,
            stack: err.stack,
        })
    }
});

router.post('/', (req, res) => {
    const { name, description, completed } = req.body;

    if(!name || !description || completed === undefined) {
        res.status(400).json({
            message: "Please provide name, description, and completed status for the project"
        });
    } else {
        Projects.insert({ name, description, completed })
            .then(({ id }) => {
                return Projects.get(id);
            })
            .then (project => {
                res.status(201).json(project)
            })
            .catch(err => {
                res.status(500).json({
                    message: "There was an error while saving the project to the database",
                    err: err.message,
                    stack: err.stack,
                });
            });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, completed } = req.body;

    // Check for all required fields
    if (!name || !description || completed === undefined) {
        return res.status(400).json({
            message: "Missing required fields: name, description, and completed status"
        });
    }

    try {
        const project = await Projects.get(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const updatedProject = await Projects.update(id, { name, description, completed });
        res.status(200).json(updatedProject);
    } catch (err) {
        res.status(500).json({
            message: "Error updating the project",
            err: err.message,
            stack: err.stack
        });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Projects.get(id);
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        await Projects.remove(id);
        res.status(204).end();  // No content to send back
    } catch (err) {
        res.status(500).json({
            message: "Error deleting the project",
            err: err.message,
            stack: err.stack
        });
    }
});

router.get('/:id/actions', async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Projects.get(id);
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const actions = await Projects.getProjectActions(id);
        res.json(actions);
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving actions for the project",
            err: err.message,
            stack: err.stack
        });
    }
});

module.exports = router