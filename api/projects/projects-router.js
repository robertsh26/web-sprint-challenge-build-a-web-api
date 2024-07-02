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
})

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
})

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

module.exports = router